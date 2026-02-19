import { createContext } from 'react';
import { UserInfo } from '@/services/api/authApi';

export interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
