import request from 'supertest';
import app from '../index';
import { signRefreshToken, verifyRefreshToken } from '../utils/jwt';

describe('authentication route validation without a database', () => {
  it('rejects an invalid registration payload before persistence', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'not-an-email', password: 'short' });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
    expect(response.body.errors).toEqual(expect.any(Array));
  });

  it('rejects an invalid login payload before persistence', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it('rejects missing Google, refresh, and reset tokens', async () => {
    const [google, refresh, reset] = await Promise.all([
      request(app).post('/api/auth/google').send({}),
      request(app).post('/api/auth/refresh').send({}),
      request(app).post('/api/auth/reset-password').send({
        password: 'StrongPassword1',
      }),
    ]);

    expect(google.status).toBe(400);
    expect(refresh.status).toBe(400);
    expect(reset.status).toBe(400);
  });

  it('protects account mutation endpoints', async () => {
    const [profile, password, account] = await Promise.all([
      request(app).patch('/api/auth/profile').send({ name: 'Test User' }),
      request(app).patch('/api/auth/change-password').send({
        currentPassword: 'OldPassword1',
        newPassword: 'NewPassword2',
      }),
      request(app).delete('/api/auth/account'),
    ]);

    expect(profile.status).toBe(401);
    expect(password.status).toBe(401);
    expect(account.status).toBe(401);
  });

  it('keeps the health endpoint available without authentication', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });

  it('issues unique refresh tokens even within the same second', () => {
    const payload = {
      id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'user' as const,
    };
    const first = signRefreshToken(payload);
    const second = signRefreshToken(payload);

    expect(first).not.toBe(second);
    expect(verifyRefreshToken(first).id).toBe(payload.id);
    expect(verifyRefreshToken(second).id).toBe(payload.id);
  });

  it('requires a configured Google audience in production', async () => {
    const previousEnvironment = process.env.NODE_ENV;
    const previousClientId = process.env.GOOGLE_CLIENT_ID;
    process.env.NODE_ENV = 'production';
    delete process.env.GOOGLE_CLIENT_ID;

    try {
      const response = await request(app)
        .post('/api/auth/google')
        .send({ accessToken: 'not-a-real-token' });

      expect(response.status).toBe(503);
      expect(response.body.error).toMatch(/not configured/i);
    } finally {
      process.env.NODE_ENV = previousEnvironment;
      if (previousClientId) process.env.GOOGLE_CLIENT_ID = previousClientId;
      else delete process.env.GOOGLE_CLIENT_ID;
    }
  });
});
