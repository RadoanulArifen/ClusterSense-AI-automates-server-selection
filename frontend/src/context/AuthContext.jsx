import { createContext, useContext, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const authenticate = async (request) => {
    setLoading(true);
    try {
      const res = await request();
      const { access_token, user: u } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Login failed' };
    } finally { setLoading(false); }
  };

  const login = (email, password) => authenticate(() => authAPI.login(email, password));
  const demoLogin = () => authenticate(() => authAPI.demoLogin());

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, demoLogin, logout, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
