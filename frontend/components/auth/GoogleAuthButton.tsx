'use client';

import { useEffect, useRef, useState } from 'react';
import {
  GoogleLogin,
  type CredentialResponse,
} from '@react-oauth/google';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoogleConfiguration } from '@/components/providers/GoogleProvider';
import { getApiErrorMessage } from '@/lib/api-client';

type GoogleAuthButtonProps = {
  action: 'sign-in' | 'sign-up';
  disabled?: boolean;
  onAttempt?: () => void;
  onCredential: (googleCredential: string) => Promise<void>;
  onAuthenticated: () => void;
  onError?: (message: string) => void;
};

const actionCopy = {
  'sign-in': {
    fallback: 'Google sign-in failed. Please try again or sign in with email.',
    providerError: 'Google sign-in could not be completed. Please try again.',
    unavailable: 'Google sign-in is not configured for this app.',
  },
  'sign-up': {
    fallback: 'Google sign-up failed. Please try again or create an account with email.',
    providerError: 'Google sign-up could not be completed. Please try again.',
    unavailable: 'Google sign-up is not configured for this app.',
  },
} as const;

export function GoogleAuthButton({
  action,
  disabled = false,
  onAttempt,
  onCredential,
  onAuthenticated,
  onError,
}: GoogleAuthButtonProps) {
  const { isConfigured, scriptStatus } = useGoogleConfiguration();
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(320);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const copy = actionCopy[action];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      const width = Math.floor(container.getBoundingClientRect().width);
      if (width > 0) setButtonWidth(Math.min(400, width));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const reportError = (message: string) => {
    setErrorMessage(message);
    onError?.(message);
  };

  const handleCredential = async ({ credential }: CredentialResponse) => {
    onAttempt?.();
    setErrorMessage('');

    if (!credential) {
      reportError(copy.providerError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onCredential(credential);
      onAuthenticated();
    } catch (error) {
      reportError(getApiErrorMessage(error, copy.fallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderError = () => {
    setIsSubmitting(false);
    reportError(copy.providerError);
  };

  const busy = disabled || isSubmitting;

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="relative min-h-10 w-full overflow-hidden rounded">
        {!isConfigured ? (
          <Button type="button" variant="outline" className="h-10 w-full" disabled>
            {copy.unavailable}
          </Button>
        ) : scriptStatus === 'error' ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full"
            onClick={() => window.location.reload()}
          >
            <RefreshCw />
            Retry Google {action}
          </Button>
        ) : scriptStatus === 'loading' ? (
          <Button type="button" variant="outline" className="h-10 w-full" disabled>
            <Loader2 className="animate-spin" />
            Loading Google {action}&hellip;
          </Button>
        ) : (
          <>
            <GoogleLogin
              onSuccess={handleCredential}
              onError={handleProviderError}
              click_listener={() => {
                onAttempt?.();
                setErrorMessage('');
              }}
              context={action === 'sign-up' ? 'signup' : 'signin'}
              text="continue_with"
              theme="outline"
              size="large"
              shape="rectangular"
              ux_mode="popup"
              auto_select={false}
              logo_alignment="left"
              width={buttonWidth}
              containerProps={{
                className:
                  'flex w-full justify-center [&>div]:!w-full [&_iframe]:!w-full',
              }}
            />
            {busy && (
              <div
                className="absolute inset-0 flex items-center justify-center gap-2 border bg-background text-sm font-medium"
                aria-live="polite"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting securely&hellip;
              </div>
            )}
          </>
        )}
      </div>

      {!isConfigured && (
        <p className="text-center text-xs text-muted-foreground">
          Add a valid <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to enable Google auth.
        </p>
      )}
      {scriptStatus === 'error' && isConfigured && (
        <p role="alert" className="text-center text-xs text-destructive">
          Google could not load. Check your connection, then retry.
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="text-center text-xs text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
