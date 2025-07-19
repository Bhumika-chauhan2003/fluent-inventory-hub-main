// components/common/SessionGuard.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SessionGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkExpiry = async () => {
      try {
        const response = await fetch(
          '/api/macros/s/AKfycbxMZsH-pM2tebJTnpeDkEXPysA4ArFpGe8XZSJhp3dNiQXl5Mbam7u6x8qvqja1RQy1/exec',
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
