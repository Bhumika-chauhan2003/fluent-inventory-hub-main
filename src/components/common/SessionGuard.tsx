// components/common/SessionGuard.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkExpiry = async () => {
      try {
        console.log("CheckExiryURL********",import.meta.env.VITE_LOGIN_URL)
        const response = await fetch(
          import.meta.env.VITE_LOGIN_URL,
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
