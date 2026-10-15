import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('skilltrack_token');
      const cachedUser = localStorage.getItem('skilltrack_user');

      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {}
      }

      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
            setProfile(res.data.profile);
            localStorage.setItem('skilltrack_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid');
          localStorage.removeItem('skilltrack_token');
          localStorage.removeItem('skilltrack_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('skilltrack_token', res.data.token);
      localStorage.setItem('skilltrack_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      // Fetch profile
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data?.success) {
          setProfile(meRes.data.profile);
        }
      } catch (e) {}
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      localStorage.setItem('skilltrack_token', res.data.token);
      localStorage.setItem('skilltrack_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data?.success) {
          setProfile(meRes.data.profile);
        }
      } catch (e) {}
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('skilltrack_token');
    localStorage.removeItem('skilltrack_user');
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.success) {
      setUser(res.data.user);
      setProfile(res.data.profile);
      localStorage.setItem('skilltrack_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
