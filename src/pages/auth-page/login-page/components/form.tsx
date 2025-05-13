"use client";

import { Formik, Form, Field, FormikProps } from "formik";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import Link from "next/link";
import { useAppDispatch } from "@/lib/redux/hooks";
import { login } from "@/lib/redux/features/authSlice";

import { loginValidationSchema } from "./schema";
import ILogin, { ILoginResponse } from "./types";
import { API_BASE_URL } from "@/components/config/api";

export default function LoginForm() {
  const router = useRouter();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Focus the email input when component mounts
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const initialValues: ILogin = {
    email: "",
    password: "",
  };

  const handleLogin = async (values: ILogin) => {
    try {
      console.log("Sending login data:", values);

      const response = await axios.post<ILoginResponse>(
        `${API_BASE_URL}/auth/login`,
        values
      );

      console.log("Login response:", response.data);

      if (!response.data || !response.data.user || !response.data.user.token) {
        console.error("Unexpected response format:", response.data);
        alert("Login failed: Unexpected server response");
        return false;
      }

      // Extract user data and token from response
      const { token, user } = response.data.user;

      // Dispatch login action to Redux
      dispatch(
        login({
          token,
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
          },
        })
      );

      // Show success message
      alert("Login Successful! Redirecting to home page...");

      // Redirect to home page
      router.push("/");

      return true;
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle specific error messages from the backend
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      alert(errorMessage);

      return false;
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-4 sm:p-6 bg-[#FAF0D7] rounded-xl shadow-lg border border-[#FFD9C0]">
      <h2 className="title text-xl sm:text-2xl mb-6 text-center text-[#222432] font-bold">
        Login to Your Account
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={loginValidationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          const success = await handleLogin(values);
          setSubmitting(false);
        }}
      >
        {({ errors, touched, isSubmitting }: FormikProps<ILogin>) => (
          <Form className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#222432] mb-1"
              >
                Email Address
              </label>
              <Field
                id="email"
                name="email"
                type="email"
                innerRef={emailInputRef}
                placeholder="your.email@example.com"
                className="mt-1 block w-full rounded-lg border-[#FFD9C0] bg-white shadow-sm focus:border-[#6096B4] focus:ring-[#6096B4] px-4 py-2.5 transition duration-150 ease-in-out"
              />
              {errors.email && touched.email && (
                <div className="text-red-500 text-xs mt-1">{errors.email}</div>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#222432] mb-1"
              >
                Password
              </label>
              <Field
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className="mt-1 block w-full rounded-lg border-[#FFD9C0] bg-white shadow-sm focus:border-[#6096B4] focus:ring-[#6096B4] px-4 py-2.5 transition duration-150 ease-in-out"
              />
              {errors.password && touched.password && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.password}
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-[#6096B4] hover:text-[#4a7a91] transition duration-150 ease-in-out"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-4xl bg-[#F4BFBF] text-[#222432] font-semibold shadow-md hover:bg-[#f5a8a8] transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
              >
                {isSubmitting ? "Logging in..." : "Sign in"}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-[#222432]">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="font-medium text-[#6096B4] hover:text-[#4a7a91] transition duration-150 ease-in-out"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
