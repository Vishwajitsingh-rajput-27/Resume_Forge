import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import User from '../models/User';

const hasMongo = Boolean(process.env.MONGODB_URI);
const describeWithMongo = hasMongo ? describe : describe.skip;

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

describe('GET /health', () => {
  it('returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});
