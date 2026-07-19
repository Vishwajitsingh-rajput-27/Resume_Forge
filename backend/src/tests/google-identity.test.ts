import { OAuth2Client } from 'google-auth-library';
import {
  GoogleIdentity,
  InvalidGoogleCredentialError,
  googleIdentityFromPayload,
  isGoogleAuthoritativeForEmail,
  verifyGoogleCredential,
} from '../services/google-identity';

const identity = (overrides: Partial<GoogleIdentity> = {}): GoogleIdentity => ({
  sub: 'google-subject',
  email: 'person@example.com',
  name: 'Person',
  ...overrides,
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Google identity verification policy', () => {
  it('verifies an ID token against the configured OAuth client audience', async () => {
    const verify = jest.spyOn(OAuth2Client.prototype, 'verifyIdToken')
      .mockResolvedValue({
        getPayload: () => ({
          sub: 'google-subject',
          email: 'Jane.User@gmail.com',
          email_verified: true,
          name: 'Jane User',
        }),
      } as never);

    const result = await verifyGoogleCredential('signed-id-token', 'web-client-id');

    expect(verify).toHaveBeenCalledWith({
      idToken: 'signed-id-token',
      audience: 'web-client-id',
    });
    expect(result.email).toBe('janeuser@gmail.com');
    expect(result.sub).toBe('google-subject');
  });

  it('rejects invalid tokens and payloads without a verified email', async () => {
    jest.spyOn(OAuth2Client.prototype, 'verifyIdToken')
      .mockRejectedValue(new Error('wrong audience') as never);

    await expect(verifyGoogleCredential('bad-token', 'web-client-id'))
      .rejects.toBeInstanceOf(InvalidGoogleCredentialError);

    expect(() => googleIdentityFromPayload({
      sub: 'google-subject',
      email: 'person@example.com',
      email_verified: false,
    } as never)).toThrow(InvalidGoogleCredentialError);
  });

  it('only treats Gmail and Google Workspace emails as authoritative for linking', () => {
    expect(isGoogleAuthoritativeForEmail(identity({ email: 'person@gmail.com' }))).toBe(true);
    expect(isGoogleAuthoritativeForEmail(identity({
      email: 'person@company.example',
      hostedDomain: 'company.example',
    }))).toBe(true);
    expect(isGoogleAuthoritativeForEmail(identity({
      email: 'person@example.com',
      hostedDomain: undefined,
    }))).toBe(false);
  });
});
