import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface TokenPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

const getSecret = (name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET') => {
  const value = process.env[name]?.trim();
  if (!value && process.env.NODE_ENV === 'test') {
    return `resumeforge-test-only-${name.toLowerCase()}-secret`;
  }
  if (!value) {
    throw new Error(`${name} is required before authentication can be used.`);
  }
  if (process.env.NODE_ENV === 'production' && value.length < 32) {
    throw new Error(`${name} must be at least 32 characters in production.`);
  }
  return value;
};

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, getSecret('JWT_ACCESS_SECRET'), {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES || '15m') as jwt.SignOptions['expiresIn'],
  });

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, getSecret('JWT_REFRESH_SECRET'), {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d') as jwt.SignOptions['expiresIn'],
    jwtid: crypto.randomUUID(),
  });

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, getSecret('JWT_ACCESS_SECRET')) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, getSecret('JWT_REFRESH_SECRET')) as TokenPayload;

export const decodeToken = (token: string) => jwt.decode(token);
