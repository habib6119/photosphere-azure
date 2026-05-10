import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch('/auth/me');
        setUser(data.user);
      } catch {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = (token, nextUser) => {
    localStorage.setItem('token', token);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout, loading }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
