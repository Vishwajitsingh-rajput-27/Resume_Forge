'use client';

import { createContext, useContext } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

type GoogleConfiguration = {
  isConfigured: boolean;
};

const GoogleConfigurationContext = createContext<GoogleConfiguration>({
  isConfigured: false,
});

export const useGoogleConfiguration = () =>
  useContext(GoogleConfigurationContext);

export function GoogleProvider({ children }: { children: React.ReactNode }) {
  const configuredClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const isConfigured = Boolean(
    configuredClientId
    && configuredClientId.endsWith('.apps.googleusercontent.com')
    && !configuredClientId.toLowerCase().includes('xxxx'),
  );
  const clientId = isConfigured
    ? configuredClientId!
    : 'google-login-disabled.apps.googleusercontent.com';

  return (
    <GoogleConfigurationContext.Provider value={{ isConfigured }}>
      <GoogleOAuthProvider clientId={clientId}>
        {children}
      </GoogleOAuthProvider>
    </GoogleConfigurationContext.Provider>
  );
}
