import ReviewPage from "@/pages/review-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Write a Review | Quick Ticket",
  description: "Share your experience about an event you attended",
};

export default function NewReviewPage() {
  return <ReviewPage />;
}