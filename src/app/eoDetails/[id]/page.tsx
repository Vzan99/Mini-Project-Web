import EODetailsPage from "@/pages/eoDetails-page";
import { Metadata } from "next";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Organizer Profile | Quick Ticket`,
    description: `View events and reviews for this organizer`,
  };
}

export default function OrganizerPage({ params }: Props) {
  // In Next.js app router, we can access the ID from params
  // and pass it to the EODetailsPage component
  return <EODetailsPage />;
}
