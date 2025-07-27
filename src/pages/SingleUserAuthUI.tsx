import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

// ✅ Replace this with your full deployed Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbwTf71UTfGGZJgZ5RYpjQAzWB_DftIDw5u-Mhez8kHaha6Xtuwq6OaL_QtbPOroWOVF/exec";
// Validation schema
const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Device ID Key for Local Storage
const DEVICE_ID_KEY = "deviceId";
const EXPIRY_DATE_KEY = "expiryDate";

// ✅ Get or set static deviceId
function getStaticDeviceId() {
  let storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!storedDeviceId) {
    storedDeviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
    console.log("New Device ID generated:", storedDeviceId);
  }
  return storedDeviceId;
}

// ✅ API request to register/login user
async function authenticateUser(
  action: "register" | "login",
  username: string,
  password: string,
  device: string
) {
  const formData = new URLSearchParams();
  formData.append("action", action);
  formData.append("username", username);
  formData.append("password", password);
  formData.append("device", device);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json(); // Google Apps Script must return JSON
    return data;
  } catch (error) {
    console.error(`Error in ${action}User:`, error);
    throw error;
  }
}

export default function SingleUserAuthUI() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(authSchema),
  });

  const [isRegistering, setIsRegistering] = useState(true);
  const [deviceId, setDeviceId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const staticDeviceId = getStaticDeviceId();
    setDeviceId(staticDeviceId);

    const expiryDate = localStorage.getItem(EXPIRY_DATE_KEY);
    if (expiryDate && new Date(expiryDate) < new Date()) {
      console.log("Session expired, redirecting to logout");
      localStorage.removeItem("auth_token");
      localStorage.removeItem(EXPIRY_DATE_KEY);
      navigate("/logout");
    }
  }, [navigate]);

  const onSubmit = async (data: { username: string; password: string }) => {
    try {
      const action = isRegistering ? "register" : "login";
      const response = await authenticateUser(
        action,
        data.username,
        data.password,
        deviceId
      );

      if (response.success) {
        toast.success(response.message);

        if (action === "login") {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 1);

          localStorage.setItem("auth_token", "true");
          localStorage.setItem(EXPIRY_DATE_KEY, expiryDate.toISOString());
          localStorage.setItem(DEVICE_ID_KEY, deviceId);

          console.log("User logged in successfully");
          navigate("/");
        } else {
          // If registration is successful, switch to login mode
          reset();
          setIsRegistering(false);
          toast.info("Please login with your new credentials.");
        }
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <Card className="w-full max-w-md p-6 bg-white shadow-md rounded-2xl">
        <CardContent>
          <h2 className="text-2xl font-semibold text-center mb-4">
            {isRegistering ? "Register User" : "User Login"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input
                {...register("username")}
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="text-red-600 text-sm">
                  {String(errors.username.message)}
                </p>
              )}
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                {...register("password")}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-600 text-sm">
                  {String(errors.password.message)}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full mt-4">
              {isRegistering ? "Register" : "Login"}
            </Button>
          </form>
          <Separator className="my-6" />
          <Button
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full"
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Need to register?"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

