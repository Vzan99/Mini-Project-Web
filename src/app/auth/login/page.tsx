import LoginPage from "@/pages/auth-page/login-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Quick Ticket",
  description: "Login to your Quick Ticket account",
};

export default function Login() {
  return <LoginPage />;
}
