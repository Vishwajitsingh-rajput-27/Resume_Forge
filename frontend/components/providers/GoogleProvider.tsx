'use client';

import { createContext, useContext, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

type GoogleConfiguration = {
  isConfigured: boolean;
  scriptStatus: 'loading' | 'ready' | 'error';
};

// OAuth client IDs are public identifiers. Keep the current production client
// here so a stale Vercel build-time variable cannot leave Google auth pointed
// at the retired Cloud project during this migration.
const PRODUCTION_GOOGLE_CLIENT_ID =
  '724976452202-nbnqbtct1nq7q9kitk3eonkhaqpart14.apps.googleusercontent.com';
const LEGACY_GOOGLE_CLIENT_ID =
  '592122697096-oitfkdtg1qvlp1ugtbo7qrcgtfg0cmko.apps.googleusercontent.com';

const GoogleConfigurationContext = createContext<GoogleConfiguration>({
  isConfigured: false,
  scriptStatus: 'loading',
});

export const useGoogleConfiguration = () =>
  useContext(GoogleConfigurationContext);

export function GoogleProvider({ children }: { children: React.ReactNode }) {
  const [scriptStatus, setScriptStatus] =
    useState<GoogleConfiguration['scriptStatus']>('loading');
  const environmentClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const configuredClientId =
    !environmentClientId || environmentClientId === LEGACY_GOOGLE_CLIENT_ID
      ? PRODUCTION_GOOGLE_CLIENT_ID
      : environmentClientId;
  const isConfigured = Boolean(
    configuredClientId
    && configuredClientId.endsWith('.apps.googleusercontent.com')
    && !configuredClientId.toLowerCase().includes('xxxx'),
  );
  const clientId = isConfigured
    ? configuredClientId!
    : 'google-login-disabled.apps.googleusercontent.com';

  return (
    <GoogleConfigurationContext.Provider value={{ isConfigured, scriptStatus }}>
      <GoogleOAuthProvider
        clientId={clientId}
        onScriptLoadSuccess={() => setScriptStatus('ready')}
        onScriptLoadError={() => setScriptStatus('error')}
      >
        {children}
      </GoogleOAuthProvider>
    </GoogleConfigurationContext.Provider>
  );
}
