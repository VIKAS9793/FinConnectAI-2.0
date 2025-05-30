import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface Auth0ProviderWithNavigateProps {
  children: ReactNode;
}

export const Auth0ProviderWithNavigate = ({ children }: Auth0ProviderWithNavigateProps) => {
  const navigate = useNavigate();
  
  // Get configuration from environment variables with fallbacks
  const domain = import.meta.env.VITE_AUTH0_DOMAIN || 'dev-xxxxx.us.auth0.com';
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy';
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE || 'https://api.finconnectai.com';

  const onRedirectCallback = (appState: any) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: 'read:current_user update:current_user_metadata',
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
