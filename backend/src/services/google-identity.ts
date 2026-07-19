import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { normalizeAccountEmail } from '../utils/email';

export interface GoogleIdentity {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  hostedDomain?: string;
}

export class InvalidGoogleCredentialError extends Error {
  constructor() {
    super('Invalid or expired Google credential.');
    this.name = 'InvalidGoogleCredentialError';
  }
}

const googleClient = new OAuth2Client();

export const isGoogleAuthoritativeForEmail = (identity: GoogleIdentity): boolean => {
  const domain = identity.email.split('@')[1]?.toLowerCase();
  return domain === 'gmail.com' || Boolean(identity.hostedDomain?.trim());
};

export const googleIdentityFromPayload = (
  payload: TokenPayload | undefined,
): GoogleIdentity => {
  if (
    !payload?.sub
    || !payload.email
    || payload.email_verified !== true
  ) {
    throw new InvalidGoogleCredentialError();
  }

  const email = normalizeAccountEmail(payload.email);
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new InvalidGoogleCredentialError();
  }

  const fallbackName = email.split('@')[0] || 'ResumeForge user';
  const name = (payload.name?.trim() || fallbackName).slice(0, 100);

  return {
    sub: payload.sub,
    email,
    name,
    picture: payload.picture,
    hostedDomain: payload.hd,
  };
};

export const verifyGoogleCredential = async (
  credential: string,
  clientId: string,
): Promise<GoogleIdentity> => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    return googleIdentityFromPayload(ticket.getPayload());
  } catch (error) {
    if (error instanceof InvalidGoogleCredentialError) throw error;
    throw new InvalidGoogleCredentialError();
  }
};
