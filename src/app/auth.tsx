"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { jwtDecode } from "jwt-decode";
import { login } from "@/lib/redux/features/authSlice";
import { IPayloadLogin } from "@/lib/redux/features/authSlice";

// Define the structure of your JWT token payload
interface JwtPayload {
  id?: string;
  sub?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  [key: string]: any; // For any other fields in the token
}

export default function Auth({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  // Function to refresh login state from localStorage
  const refreshLogin = async () => {
    try {
      // Get token from localStorage instead of cookies
      const token = localStorage.getItem("token");

      if (token) {
        console.log("Found token in localStorage");

        // Decode the JWT token with proper typing
        const decoded = jwtDecode<JwtPayload>(token);
        console.log("Decoded token:", decoded);

        // Check if user data is stored in localStorage
        const userDataStr = localStorage.getItem("user");
        let userData: IPayloadLogin;

        if (userDataStr) {
          // If user data exists in localStorage, use it
          userData = JSON.parse(userDataStr);
          console.log("Found user data in localStorage:", userData);
        } else {
          // Otherwise extract from decoded token
          userData = {
            id: decoded.id || decoded.sub || "",
            email: decoded.email || "",
            first_name: decoded.first_name || "",
            last_name: decoded.last_name || "",
            role: decoded.role || "",
          };
        }

        // Dispatch login action with token and user data
        dispatch(
          login({
            token: token,
            user: userData,
          })
        );

        console.log("Auto-login successful from localStorage token");
      } else {
        console.log("No token found in localStorage");
      }
    } catch (error) {
      console.error("Error refreshing login:", error);
    }
  };

  // Run once when component mounts
  useEffect(() => {
    refreshLogin();
  }, []);

  return <>{children}</>;
}
