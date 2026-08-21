import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load stored token on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('freshcart_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (err) {
      // Token invalid or expired
      await AsyncStorage.removeItem('freshcart_token');
    } finally {
      setIsLoading(false);
    }
  };

  const register = useCallback(async (name, email, password, phone) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, phone });
      await AsyncStorage.setItem('freshcart_token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('freshcart_token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed.';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('freshcart_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        register,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
