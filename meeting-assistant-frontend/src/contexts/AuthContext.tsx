'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const res = await authAPI.getMe();
          if (res.data?.data?.user) {
            setUser(res.data.data.user);
            console.log('✅ User authenticated:', res.data.data.user);
          } else if (res.data?.user) {
            setUser(res.data.user);
            console.log('✅ User authenticated:', res.data.user);
          }
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('📝 Attempting registration...');
      const res = await authAPI.register({ name, email, password });
      
      // Handle token from response
      const token = res.data?.data?.token || res.data?.token;
      const userData = res.data?.data?.user || res.data?.user;

      if (token) {
        localStorage.setItem('authToken', token);
        console.log('🔑 Token saved to localStorage');
      }

      if (userData) {
        setUser(userData);
        console.log('✅ Registration successful:', userData);
      }
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login...');
      const res = await authAPI.login({ email, password });
      
      // Handle token from response
      const token = res.data?.data?.token || res.data?.token;
      const userData = res.data?.data?.user || res.data?.user;

      if (token) {
        localStorage.setItem('authToken', token);
        console.log('🔑 Token saved to localStorage');
      }

      if (userData) {
        setUser(userData);
        console.log('✅ Login successful:', userData);
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    
    // Clear token from localStorage
    localStorage.removeItem('authToken');
    
    // Clear user state
    setUser(null);
    
    console.log('✅ Logout successful');
    console.log('🔄 Redirecting to login page...');
    
    // Redirect to login page
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}