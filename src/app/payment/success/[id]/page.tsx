import PaymentSuccessPage from "@/pages/payment-page/paymentSuccess-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Success | Quick Ticket",
  description: "Your payment has been successfully processed",
};

export default async function PaymentSuccess({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return <PaymentSuccessPage transactionId={id} />;
}
