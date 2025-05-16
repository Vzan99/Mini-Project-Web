import TicketDetailsPage from "@/pages/ticket-details-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Tickets | Quick Ticket",
  description: "View and download your event tickets",
};

export default async function TicketsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TicketDetailsPage transactionId={slug} />;
}
