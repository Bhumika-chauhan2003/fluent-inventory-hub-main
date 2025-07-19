// src/pages/Logout.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    //localStorage.removeItem("isLoggedIn");
   // localStorage.removeItem("expiryDate");
  //  localStorage.removeItem("deviceId");
    navigate("/login");
  }, []);

  return <div>Logging you out...</div>;
}
