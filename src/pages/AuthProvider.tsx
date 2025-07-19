// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isLoggedIn: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEVICE_ID_KEY = "deviceId";
const EXPIRY_DATE_KEY = "expiryDate";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionExpiry = () => {
      const expiryDate = localStorage.getItem(EXPIRY_DATE_KEY);
      if (!expiryDate || new Date(expiryDate) < new Date()) {
        console.log("Session expired, logging out");
        logout();
      } else {
        setIsLoggedIn(true);
      }
    };

    // Initial check
    checkSessionExpiry();

    // Set up an interval to check expiry every minute
    const intervalId = setInterval(checkSessionExpiry, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem(EXPIRY_DATE_KEY);
    localStorage.removeItem(DEVICE_ID_KEY);
    setIsLoggedIn(false);
    navigate("/logout");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
