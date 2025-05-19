import TicketDetailsPage from "@/pages/ticket-details-page";

export default async function TicketsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TicketDetailsPage transactionId={slug} />;
}
