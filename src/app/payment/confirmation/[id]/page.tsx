import PaymentConfirmationPage from "@/pages/payment-confirmation-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Confirmation | Quick Ticket",
  description: "Confirm your payment details",
};

export default function PaymentConfirmation({ params }: { params: { id: string } }) {
  return <PaymentConfirmationPage transactionId={params.id} />;
}