import { vi } from 'vitest';

const mockToken = 'test-token';

export const mockAuthContext = {
  login: vi.fn(),
  logout: vi.fn(),
  user: { name: 'Test User' },
  isAuthenticated: true,
  isLoading: false,
  getAccessToken: vi.fn().mockResolvedValue(mockToken),
};

export const useAuth = () => mockAuthContext;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => 
  <div>{children}</div>;
