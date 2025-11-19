import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/config/api';
import { showToast } from '@/lib/utils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Listen for token expiry events
  useEffect(() => {
    const handleExpired = () => {
      showToast.error('Your session has expired. Please login again to continue.');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);

      // Navigate to login page after a brief delay to show the toast
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    };

    window.addEventListener('auth:expired', handleExpired);

    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: userData } = response.data;

      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);

      if (!error.response) {
        // Network error
        showToast.error('Network error - please check your connection');
        return {
          success: false,
          error: 'Network error - please check your connection'
        };
      }

      const errorMessage = error.response?.data?.message || 'Login failed - please check your credentials';
      showToast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { accessToken, refreshToken, user: userData } = response.data;

      localStorage.setItem('authToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);

      if (!error.response) {
        // Network error
        showToast.error('Network error - please check your connection');
        return {
          success: false,
          error: 'Network error - please check your connection'
        };
      }

      const errorMessage = error.response?.data?.message || 'Registration failed - please try again';
      showToast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = () => {
    setIsLoggingOut(true);
    showToast.success('Logged out successfully');

    // Clear all authentication and onboarding related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);

    // Clear any global onboarding state
    if (window.forceOnboardingRecheck) {
      delete window.forceOnboardingRecheck;
    }

    // Brief delay to show loading state, then navigate
    setTimeout(() => {
      window.location.href = '/login';
    }, 300);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    isLoading,
    isLoggingOut,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
