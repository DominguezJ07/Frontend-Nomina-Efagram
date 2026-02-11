import { createContext, useEffect, useState } from 'react';
import {
  loginRequest,
  meRequest,
  logoutRequest,
} from '../../features/auth/services/auth.service';
import {
  setToken,
  getToken,
  clearToken,
} from '../../core/auth/tokenStorage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        if (getToken()) {
          const userData = await meRequest();
          setUser(userData);
        }
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (credentials) => {
    const data = await loginRequest(credentials);

    const token =
      data.token ||
      data.accessToken ||
      data?.data?.token ||
      data?.data?.accessToken;

    if (!token) {
      throw new Error('Token no recibido del backend');
    }

    setToken(token);

    const userData = await meRequest();
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      clearToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
