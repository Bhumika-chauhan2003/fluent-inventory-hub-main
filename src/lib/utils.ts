import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
const DEVICE_ID_KEY = "deviceId";
const EXPIRY_DATE_KEY = "expiryDate";
// utils/auth.ts
export function checkSessionAndDevice() {
  debugger;
  const expiryDate = localStorage.getItem(EXPIRY_DATE_KEY);
  const deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!expiryDate || !deviceId) {
    // Not logged in or device not registered
    return false;
  }

  if (new Date(expiryDate) < new Date()) {
    // Session expired
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem(EXPIRY_DATE_KEY);
    return false;
  }

  return true;
}
