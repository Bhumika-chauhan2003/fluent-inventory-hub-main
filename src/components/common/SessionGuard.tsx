// components/common/SessionGuard.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SessionGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkExpiry = async () => {
      try {
        const response = await fetch(
          'https://script.google.com/macros/s/AKfycbwTf71UTfGGZJgZ5RYpjQAzWB_DftIDw5u-Mhez8kHaha6Xtuwq6OaL_QtbPOroWOVF/exec',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'checkExpiry' }),
          }
        );

        const result = await response.json();
        if (result.expired) {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('expring');
          navigate('/logout');
        }
      } catch (error) {
        console.error('Session validation failed', error);
      }
    };

    checkExpiry();
  }, [navigate]);

  return <>{children}</>;
};

export default SessionGuard;
