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

// Helper: extrae el objeto user de cualquier shape que devuelva el backend
// Soporta: { data: { id, nombre, ... } }  o  { id, nombre, ... }
const extractUser = (response) => {
  if (!response) return null;
  // Shape: { success, data: { user } } - backend /auth/me devuelve data.data
  if (response?.data?.data) return response.data.data;
  // Shape: { success, data: { id, nombre } }
  if (response?.data?.id || response?.data?.email) return response.data;
  // Shape plana
  if (response?.id || response?.email) return response;
  return null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        if (getToken()) {
          const response = await meRequest();
          const userData = extractUser(response);
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

    // El backend devuelve { success, data: { user, token } }
    const token =
      data?.data?.token ||
      data?.token ||
      data?.data?.accessToken ||
      data?.accessToken;

    if (!token) {
      throw new Error('Token no recibido del backend');
    }

    setToken(token);

    const response = await meRequest();
    const userData = extractUser(response);
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