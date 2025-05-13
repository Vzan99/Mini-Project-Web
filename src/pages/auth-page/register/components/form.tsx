"use client";

import { Formik, Form, Field, FormikProps } from "formik";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";

import { registerValidationSchema } from "./schema";
import IRegister from "./types";

export default function RegisterForm() {
  const router = useRouter();
  const firstNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the first name input when component mounts
    if (firstNameInputRef.current) {
      firstNameInputRef.current.focus();
    }
  }, []);

  const initialValues: IRegister = {
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    username: "",
    referral_code: "",
    role: "customer",
  };

  const register = async (values: IRegister) => {
    try {
      console.log("Sending registration data:", values);

      const response = await axios.post(
        "https://mini-project-api-2-eight.vercel.app/auth/register",
        values
      );

      console.log("Registration response:", response.data);

      // The response structure from backend is:
      // {
      //   "message": "Register Success!",
      //   "data": { user object }
      // }

      if (!response.data || !response.data.message) {
        console.error("Unexpected response format:", response.data);
        alert("Registration failed: Unexpected server response");
        return false;
      }

      // Show success message with additional info about welcome email
      alert(
        "Registration Successful! A welcome email has been sent to your inbox. You can now log in."
      );
      return true;
    } catch (err: any) {
      // Log the complete error object
      console.error("Registration error:", err);

      // Handle specific error messages from your backend
      if (err.response && err.response.data) {
        const statusCode = err.response.status;
        console.log("Error status:", statusCode);
        console.log("Error data:", err.response.data);

        const errorMessage = err.response.data.message || "";
        console.log("Registration error message:", errorMessage);

        if (errorMessage.includes("Email already exists")) {
          alert(
            "This email is already registered. Please use a different email or try logging in."
          );
        } else if (errorMessage.includes("Username already taken")) {
          alert(
            "This username is already taken. Please choose a different username."
          );
        } else if (errorMessage.includes("Invalid referral code")) {
          alert(
            "The referral code you entered is invalid. Please check and try again."
          );
        } else if (statusCode === 500) {
          alert(
            "Server error. The registration service is currently experiencing issues. Please try again later."
          );
        } else if (errorMessage) {
          // Use the server's error message if available
          alert(errorMessage);
        } else {
          alert(`Registration failed (${statusCode}). Please try again.`);
        }
      } else if (err.request) {
        // Network error - no response received
        alert(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        // Something else went wrong
        alert("Registration failed. Please try again.");
      }
      return false;
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-4 sm:p-6 bg-[#FAF0D7] rounded-xl shadow-lg border border-[#FFD9C0]">
      <h2 className="title text-xl sm:text-2xl mb-6 text-center text-[#222432] font-bold">
        Create Your Account
      </h2>
      <Formik
        initialValues={initialValues}
        validationSchema={registerValidationSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          const success = await register(values);
          if (success) {
            resetForm();
            router.push("/auth/login");
          }
          setSubmitting(false);
        }}
      >
        {(props: FormikProps<IRegister>) => {
          const { values, handleChange, touched, errors, isSubmitting } = props;

          return (
            <Form className="space-y-4">
              {/* First Name */}
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-[#222432] mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  onChange={handleChange}
                  value={values.first_name}
                  ref={firstNameInputRef}
                  className="mt-1 block w-full rounded-lg border-[#FFD9C0] bg-white shadow-sm focus:border-[#6096B4] focus:ring-[#6096B4] px-4 py-2.5 transition duration-150 ease-in-out"
                  placeholder="Enter your first name"
                />
                {touched.first_name && errors.first_name ? (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.first_name}
                  </div>
                ) : null}
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-[#222432] mb-1"
                >
                  Last Name
                </label>
                <Field
                  type="text"
                  id="last_name"
                  name="last_name"
                  placeholder="Enter your last name"
                  className="mt-1 block w-full rounded-lg border-[#FFD9C0] bg-white shadow-sm focus:border-[#6096B4] focus:ring-[#6096B4] px-4 py-2.5 transition duration-150 ease-in-out"
                />
                {touched.last_name && errors.last_name ? (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.last_name}
                  </div>
                ) : null}
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-[#222432] mb-1"
                >
                  Username
                </label>
                <Field
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Choose a username"
                  className="mt-1 block w-full rounded-lg border-[#FFD9C0] bg-white shadow-sm focus:border-[#6096B4] focus:ring-[#6096B4] px-4 py-2.5 transition duration-150 ease-in-out"
                />
                {touched.username && errors.username ? (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.username}
                  </div>
                ) : null}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#222432] mb-1"
                >
                  Email
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your.email@example.com"
                  className="mt-1 block w-full rounded-lg border-[#FFD9C0] bg-white shadow-sm focus:border-[#6096B4] focus:ring-[#6096B4] px-4 py-2.5 transition duration-150 ease-in-out"
                />
                {touched.email && errors.email ? (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.email}
                  </div>
                ) : null}
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
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  className="mt-1 block w-full rounded-lg border-[#FFD9C0] bg-white shadow-sm focus:border-[#6096B4] focus:ring-[#6096B4] px-4 py-2.5 transition duration-150 ease-in-out"
                />
                {touched.password && errors.password ? (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.password}
                  </div>
                ) : null}
              </div>

              {/* Referral Code (Optional) */}
              <div>
                <label
                  htmlFor="referral_code"
                  className="block text-sm font-medium text-[#222432] mb-1"
                >
                  Referral Code{" "}
                  <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <Field
                  type="text"
                  id="referral_code"
                  name="referral_code"
                  placeholder="Enter referral code if you have one"
                  className="mt-1 block w-full rounded-lg border-[#FFD9C0] bg-white shadow-sm focus:border-[#6096B4] focus:ring-[#6096B4] px-4 py-2.5 transition duration-150 ease-in-out"
                />
                {touched.referral_code && errors.referral_code ? (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.referral_code}
                  </div>
                ) : null}
              </div>

              {/* Role Selection */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-[#222432] mb-1"
                >
                  Register as
                </label>
                <Field
                  as="select"
                  id="role"
                  name="role"
                  className="mt-1 block w-full rounded-lg border-[#FFD9C0] bg-white focus:border-[#6096B4] focus:ring-[#6096B4] px-4 py-3 text-base transition duration-150 ease-in-out"
                >
                  <option value="customer">Customer</option>
                  <option value="event_organizer">Event Organizer</option>
                </Field>
                {touched.role && errors.role ? (
                  <div className="text-red-500 text-xs mt-1">{errors.role}</div>
                ) : null}
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-4xl bg-[#F4BFBF] text-[#222432] font-semibold shadow-md hover:bg-[#f5a8a8] transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
                >
                  {isSubmitting ? (
                    <span>Processing...</span>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center mt-4">
                <p className="text-sm text-[#222432]">
                  Already have an account?{" "}
                  <a
                    href="/auth/login"
                    className="font-medium text-[#6096B4] hover:text-[#4a7a91] transition duration-150 ease-in-out"
                  >
                    Sign in
                  </a>
                </p>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
