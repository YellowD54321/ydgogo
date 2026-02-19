import React, { useState, useCallback, useMemo } from 'react';
import { UserInfo } from '@/services/api/authApi';
import { AUTH_STORAGE_KEYS } from '@/constants/authConfig';
import { AuthContext } from './AuthContext';

function loadStoredAuth(): { token: string | null; user: UserInfo | null } {
  try {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    const userJson = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    const user = userJson ? (JSON.parse(userJson) as UserInfo) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() => loadStoredAuth().token);
  const [user, setUser] = useState<UserInfo | null>(() => loadStoredAuth().user);

  const login = useCallback((newToken: string, newUser: UserInfo) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, newToken);
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [user, token, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
