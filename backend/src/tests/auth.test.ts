import request from 'supertest';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import app from '../index';
import User from '../models/User';

const hasMongo = Boolean(process.env.MONGODB_URI);
const describeWithMongo = hasMongo ? describe : describe.skip;
const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;

beforeAll(async () => {
  if (hasMongo) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
});

afterAll(async () => {
  if (hasMongo && mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});

afterEach(async () => {
  jest.restoreAllMocks();
  if (originalGoogleClientId) process.env.GOOGLE_CLIENT_ID = originalGoogleClientId;
  else delete process.env.GOOGLE_CLIENT_ID;

  if (hasMongo) {
    await User.deleteMany({});
  }
});

describeWithMongo('POST /api/auth/register', () => {
  it('creates a new user and returns tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'Password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user).not.toHaveProperty('plan');
  });

  it('returns 409 for duplicate email', async () => {
    await User.create({ name: 'Existing', email: 'dup@example.com', password: 'Password123' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New', email: 'dup@example.com', password: 'Password123' });
    expect(res.status).toBe(409);
  });

  it('validates required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'notanemail', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });
});

describeWithMongo('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register')
      .send({ name: 'Login Test', email: 'login@example.com', password: 'Password123' });
  });

  it('returns tokens for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'Password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPass!' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123' });
    expect(res.status).toBe(401);
  });
});

describeWithMongo('GET /api/auth/me', () => {
  it('returns user for valid token', async () => {
    const { body: { accessToken } } = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Me Test', email: 'me@example.com', password: 'Password123' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@example.com');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describeWithMongo('POST /api/auth/refresh', () => {
  it('returns new access token for valid refresh token', async () => {
    const { body: { refreshToken } } = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Refresh Test', email: 'refresh@example.com', password: 'Password123' });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('returns 401 for invalid refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'invalid.token.here' });
    expect(res.status).toBe(401);
  });
});

describeWithMongo('POST /api/auth/google', () => {
  const mockGoogleIdentity = (payload: Record<string, unknown>) => {
    process.env.GOOGLE_CLIENT_ID = 'test-web-client-id';
    return jest.spyOn(OAuth2Client.prototype, 'verifyIdToken')
      .mockResolvedValue({ getPayload: () => payload } as never);
  };

  it('creates a user from a verified Google ID token', async () => {
    const verify = mockGoogleIdentity({
      sub: 'new-google-subject',
      email: 'New.User@gmail.com',
      email_verified: true,
      name: 'New User',
      picture: 'https://example.com/avatar.png',
    });

    const response = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'signed-id-token' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user.email).toBe('newuser@gmail.com');
    expect(verify).toHaveBeenCalledWith({
      idToken: 'signed-id-token',
      audience: 'test-web-client-id',
    });
    expect(await User.countDocuments()).toBe(1);
  });

  it('safely links an existing Gmail account', async () => {
    const existing = await User.create({
      name: 'Existing',
      email: 'linked.user@gmail.com',
      password: 'Password123',
    });
    mockGoogleIdentity({
      sub: 'linked-google-subject',
      email: 'linked.user@gmail.com',
      email_verified: true,
      name: 'Existing',
    });

    const response = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'signed-id-token' });

    expect(response.status).toBe(200);
    expect(await User.countDocuments()).toBe(1);
    const updated = await User.findById(existing._id);
    expect(updated?.googleId).toBe('linked-google-subject');
    expect(updated?.isEmailVerified).toBe(true);
  });

  it('requires password sign-in before linking a non-authoritative email', async () => {
    await User.create({
      name: 'Existing',
      email: 'person@example.com',
      password: 'Password123',
    });
    mockGoogleIdentity({
      sub: 'external-google-subject',
      email: 'person@example.com',
      email_verified: true,
      name: 'Existing',
    });

    const response = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'signed-id-token' });

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/email and password/i);
    expect((await User.findOne({ email: 'person@example.com' }))?.googleId).toBeUndefined();
  });

  it('rejects deactivated and conflicting accounts', async () => {
    await User.create({
      name: 'Google owner',
      email: 'first@gmail.com',
      googleId: 'shared-google-subject',
      isActive: true,
    });
    await User.create({
      name: 'Email owner',
      email: 'second@gmail.com',
      googleId: 'other-google-subject',
      isActive: true,
    });
    mockGoogleIdentity({
      sub: 'shared-google-subject',
      email: 'second@gmail.com',
      email_verified: true,
      name: 'Conflict',
    });

    const conflict = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'signed-id-token' });
    expect(conflict.status).toBe(409);

    await User.deleteMany({});
    await User.create({
      name: 'Inactive',
      email: 'inactive@gmail.com',
      googleId: 'inactive-google-subject',
      isActive: false,
    });
    mockGoogleIdentity({
      sub: 'inactive-google-subject',
      email: 'inactive@gmail.com',
      email_verified: true,
      name: 'Inactive',
    });

    const deactivated = await request(app)
      .post('/api/auth/google')
      .send({ credential: 'signed-id-token' });
    expect(deactivated.status).toBe(403);
  });
});

describe('GET /health', () => {
  it('returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});
