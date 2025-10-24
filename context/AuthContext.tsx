import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import * as api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: api.LoginCredentials, portal: 'patient' | 'hospital') => Promise<boolean>;
  register: (userData: api.RegisterUserData) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('hms_user');
    const storedToken = sessionStorage.getItem('hms_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = async (credentials: api.LoginCredentials, portal: 'patient' | 'hospital') => {
    try {
      const response = await api.login(credentials, portal);
      if (response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        sessionStorage.setItem('hms_user', JSON.stringify(response.user));
        sessionStorage.setItem('hms_token', response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };
  
  const register = async (userData: api.RegisterUserData) => {
    try {
        const response = await api.register(userData);
        return !!response.user;
    } catch (error) {
        console.error("Registration failed:", error);
        return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('hms_user');
    sessionStorage.removeItem('hms_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};