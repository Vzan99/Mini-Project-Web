import TransactionPage from "@/pages/transaction-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Quick Ticket",
  description: "Complete your ticket purchase",
};

export default function CheckoutPage() {
  return <TransactionPage />;
}