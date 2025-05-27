import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@auth0/auth0-react';

interface MockAuthContextType {
  isAuthenticated: boolean;
  user: User | undefined;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string>;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

interface MockAuthProviderProps {
  children: React.ReactNode;
}

export const MockAuthProvider = ({ children }: MockAuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    // Simulate loading state
    setTimeout(() => {
      setIsLoading(false);
      setIsAuthenticated(true);
      setUser({
        email: 'vikas.sahani@finconnectai.com',
        name: 'Vikas Sahani',
        sub: 'auth0|1234567890',
        ['https://finconnectai.com/roles']: ['user', 'admin']
      });
    }, 1000);
  }, []);

  const login = async (): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsAuthenticated(true);
    setUser({
      email: 'vikas.sahani@finconnectai.com',
      name: 'Vikas Sahani',
      sub: 'auth0|1234567890',
      ['https://finconnectai.com/roles']: ['user', 'admin']
    });
  };

  const logout = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAuthenticated(false);
    setUser(undefined);
    setIsLoading(false);
  };

  const getToken = async (): Promise<string> => {
    return Promise.resolve('mock-token-1234567890');
  };

  return (
    <MockAuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        getToken
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};
