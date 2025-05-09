import PaymentSuccessPage from "@/pages/payment-success-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Success | Quick Ticket",
  description: "Your payment has been successfully processed",
};

export default function PaymentSuccess({ params }: { params: { id: string } }) {
  return <PaymentSuccessPage transactionId={params.id} />;
}