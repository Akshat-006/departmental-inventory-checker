import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, login, logout, signup } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const handleLogin = async (payload) => {
    const response = await login(payload);
    setUser(response.data.user);
    return response;
  };

  const handleSignup = async (payload) => {
    const response = await signup(payload);
    setUser(response.data.user);
    return response;
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login: handleLogin,
      signup: handleSignup,
      logout: handleLogout,
      refreshUser: loadCurrentUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('No AuthContext available');
  }
  return context;
};
