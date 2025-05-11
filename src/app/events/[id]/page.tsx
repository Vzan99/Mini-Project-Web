import EventDetailsPage from "@/pages/event-page/eventDetails-page";
import { notFound } from "next/navigation";
import { API_BASE_URL } from "@/components/config/api";
import axios from "axios";

export default async function EventDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = await params;

  if (!eventId) {
    console.error("Missing event ID in params");
    notFound();
  }

  try {
    const event = await getEvent(eventId);

    if (!event || typeof event !== "object") {
      console.error("Invalid event data:", event);
      notFound();
    }

    return <EventDetailsPage event={event} />;
  } catch (error) {
    console.error("Error in EventDetails:", error);
    notFound();
  }
}

async function getEvent(id: string) {
  try {
    const response = await axios.get(`${API_BASE_URL}/events/${id}`);

    return response.data.data;
  } catch (error) {
    console.error("Error in getEvent:", error);
    throw error;
  }
}
