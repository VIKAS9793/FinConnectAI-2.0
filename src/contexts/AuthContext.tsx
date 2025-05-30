import { createContext, useContext, ReactNode } from 'react';
import { useMockAuth } from './MockAuthContext';
import { User } from '@auth0/auth0-react';

interface AuthContextType {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { isAuthenticated, user, isLoading, login, logout, getToken } = useMockAuth();

  // Using mock auth functions directly
  const getAccessToken = getToken;

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        user,
        isAuthenticated,
        isLoading,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
