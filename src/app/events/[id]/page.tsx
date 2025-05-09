import EventDetailsPage from "@/pages/event-page/eventDetails-page";
import { notFound } from "next/navigation";
import { API_BASE_URL } from "@/components/config/api";

async function getEvent(id: string) {
  try {
    const url = `${API_BASE_URL}/events/${id}`;
    console.log("Fetching event from:", url);

    try {
      const res = await fetch(url, {
        cache: "no-store",
        next: { revalidate: 0 }, // Revalidate every 60 seconds
      });

      if (!res.ok) {
        console.error(`API returned status ${res.status} for event ID ${id}`);
        throw new Error(`Failed to fetch event: ${res.status}`);
      }

      const data = await res.json();
      console.log("Received data:", data); // Add this to debug

      return data.data;
    } catch (fetchError) {
      console.error("API fetch failed:", fetchError);

      // For testing/development, return mock data if API fails
      if (process.env.NODE_ENV === "development") {
        console.log("Using fallback data for development");
        return {
          id: id,
          name: "Sample Event",
          start_date: "2023-12-01T10:00:00Z",
          end_date: "2023-12-01T18:00:00Z",
          description: "<p>This is a sample event description.</p>",
          event_image: "",
          location: "Sample Location",
          price: 100000,
          total_seats: 100,
          remaining_seats: 50,
          category: "concert",
          organizer_id: "1",
          organizer: {
            id: "1",
            username: "organizer",
            first_name: "Sample",
            last_name: "Organizer",
          },
          transactions: [],
          voucher: [],
          review: [],
        };
      }

      // If not in development, rethrow the error
      throw fetchError;
    }
  } catch (error) {
    console.error("Error in getEvent:", error);
    throw error;
  }
}

export default async function EventDetails({
  params,
}: {
  params: { id: string };
}) {
  try {
    console.log("Rendering event page for ID:", params.id);
    const event = await getEvent(params.id);

    // Add this check to ensure we have valid event data
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
