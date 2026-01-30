import { createContext, useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { type User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (name: string, password: string) => Promise<void>;
  register: (name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useLocalStorage<User | null>('app-user', null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  console.log('AuthProvider render, user:', user);

  const login = async (name: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();
      
      console.log('Login response:', data);
      console.log('Response OK:', response.ok);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const userData = data.user;
      console.log('Setting user to:', userData);
      
      if (!userData) {
        throw new Error('No user in response');
      }

      setUser(userData);
      
      setTimeout(() => {
        const from = (location.state as any)?.from?.pathname || '/albums';
        console.log('Navigating to:', from);
        navigate(from, { replace: true });
      }, 100);
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();
      console.log('Register response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const userData = data.user;
      if (!userData) {
        throw new Error('No user in response');
      }

      setUser(userData);
      
      setTimeout(() => {
        navigate('/albums', { replace: true });
      }, 100);
      
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Logout failed', e);
    } finally {
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};