interface AuthConfig {
  domain: string | undefined;
  clientId: string | undefined;
  authorizationParams: {
    redirect_uri: string;
    audience: string | undefined;
    scope: string;
  };
}

export const authConfig: AuthConfig = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: 'read:current_user update:current_user_metadata',
  },
};
