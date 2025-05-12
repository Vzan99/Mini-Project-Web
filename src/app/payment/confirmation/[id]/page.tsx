import PaymentConfirmationPage from "@/pages/payment-page/paymentConfirmation-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Confirmation | Quick Ticket",
  description: "Confirm your payment details",
};

export default async function PaymentConfirmation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await the params to fix the error
  const { id } = await params;
  return <PaymentConfirmationPage transactionId={id} />;
}
