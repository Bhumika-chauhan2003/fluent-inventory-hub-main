import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  isAuthenticated: boolean;
  login: (username: string, password: string, device: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const expiry = localStorage.getItem('expiry');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Check if the token is expired
    if (expiry && new Date(expiry) < new Date()) {
      logout();
    } else if (isLoggedIn) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string, device: string) => {
    try {
      const response = await fetch('/api/macros/s/AKfycbwJM9bTPWV_pV_-xDd2h8lhxAmE_ZfvhDMJ6i7KDcOV6EcN6dCKx0UkYrxut4c1vzgt/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password, device }),
      });
      const message = await response.text();

      if (message.startsWith('Login successful')) {
        // Extract expiry date if present in the response
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 3);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('expiry', expiry.toISOString());
        setIsAuthenticated(true);
        navigate('/');
      } else if (message.includes('expired')) {
        navigate('/contact-support');
      } else {
        alert(message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('expiry');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
