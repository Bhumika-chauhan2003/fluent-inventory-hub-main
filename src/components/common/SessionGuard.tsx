// components/common/SessionGuard.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkExpiry = async () => {
      try {
        const response = await fetch(
          "https://script.google.com/macros/s/AKfycbzezD3ia4vqNFxCvdcRSYHxSRTeEKWLjYAw8jqM3U_-l1CygNc3CEPwb6SZunGcW8LB/exec",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded", // ✅ simple CORS-safe header
            },
            body: new URLSearchParams({
              action: "checkExpiry",
            }),
          }
        );

        const result = await response.json();
        if (result.expired) {
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("expring");
          navigate("/logout");
        }
      } catch (error) {
        console.error("Session validation failed", error);
      }
    };

    checkExpiry();
  }, [navigate]);

  return <>{children}</>;
};

export default SessionGuard;
