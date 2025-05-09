import EventDetailsPage from "@/pages/event-page/eventDetails-page";
import { notFound } from "next/navigation";
import { API_BASE_URL } from "@/components/config/api";

// Define the page component with generateStaticParams to help Next.js understand the dynamic routes
export default async function EventDetails({
  params,
}: {
  params: { id: string };
}) {
  // Extract the ID first to avoid directly accessing params.id multiple times
  const eventId = params?.id;

  if (!eventId) {
    console.error("Missing event ID in params");
    notFound();
  }

  console.log("Rendering event page for ID:", eventId);

  try {
    // Fetch the event data
    const event = await getEvent(eventId);

    if (!event || typeof event !== "object") {
      console.error("Invalid event data:", event);
      notFound();
    }

    // Render the event details page
    return <EventDetailsPage event={event} />;
  } catch (error) {
    console.error("Error in EventDetails:", error);
    notFound();
  }
}

// Separate function to fetch event data
async function getEvent(id: string) {
  try {
    const url = `${API_BASE_URL}/events/${id}`;
    console.log("Fetching event from:", url);

    try {
      const res = await fetch(url, {
        cache: "no-store",
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        console.error(`API returned status ${res.status} for event ID ${id}`);
        throw new Error(`Failed to fetch event: ${res.status}`);
      }

      const data = await res.json();
      console.log("Received data:", data);

      return data.data;
    } catch (fetchError) {
      console.error("API fetch failed:", fetchError);

      // For testing/development, return mock data if API fails
      if (process.env.NODE_ENV === "development") {
        console.log("Using fallback data for development");
        return {
          id,
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

      throw fetchError;
    }
  } catch (error) {
    console.error("Error in getEvent:", error);
    throw error;
  }
}
