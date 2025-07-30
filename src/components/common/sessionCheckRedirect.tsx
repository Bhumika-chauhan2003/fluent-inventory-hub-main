// src/components/common/SessionCheckRedirect.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const EXPIRY_DATE_KEY = 'expiryDate';
const AUTH_TOKEN_KEY = 'auth_token';
export default function SessionCheckRedirect() {
const navigate = useNavigate();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem(AUTH_TOKEN_KEY);
    const expiryDate = localStorage.getItem(EXPIRY_DATE_KEY);

    if (isLoggedIn && expiryDate) {
      const today = new Date().toISOString().split('T')[0];
      const expiry = new Date(expiryDate).toISOString().split('T')[0];

      if (today >= expiry) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(EXPIRY_DATE_KEY);
        toast.error('Your subscription has expired.');
        navigate('/logout');
        return;
      }

      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null;
}
