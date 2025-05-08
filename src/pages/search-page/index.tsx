import SearchBar from "@/components/searchbar";
import { IEventCard } from "@/interfaces/eventCard";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const searchQuery = typeof params.query === "string" ? params.query : "";
  const category = typeof params.category === "string" ? params.category : "";
  const location = typeof params.location === "string" ? params.location : "";

  // Fetch events based on search query and filters
  let events: IEventCard[] = [];
  let error = null;

  try {
    if (searchQuery) {
      let url = `http://localhost:8000/events/search?query=${encodeURIComponent(
        searchQuery
      )}&limit=20`;

      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (location) url += `&location=${encodeURIComponent(location)}`;

      const response = await fetch(url, { cache: "no-store" });

      if (!response.ok) throw new Error("Failed to fetch search results");
      const data = await response.json();
      events = data.data || [];
    }
  } catch (err) {
    error = "Failed to fetch search results";
    console.error(err);
  }

  const cloudinaryBaseUrl =
    "https://res.cloudinary.com/dnb5cxo2m/image/upload/";

  // Format date in user-friendly way
  const formatEventDates = (start_date: string, end_date: string) => {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const isSameDay = startDate.toDateString() === endDate.toDateString();

    if (isSameDay) {
      // Format: 10 May 2025
      return startDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else if (
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()
    ) {
      // Format: 10 - 12 May 2025
      return `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleDateString(
        "en-GB",
        {
          month: "long",
          year: "numeric",
        }
      )}`;
    } else {
      // Different months or years
      return `${startDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })} - ${endDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`;
    }
  };

  // Build filter description
  const getFilterDescription = () => {
    let description = `${events.length} ${
      events.length === 1 ? "result" : "results"
    } for "${searchQuery}"`;

    if (category) description += ` in category "${category}"`;
    if (location) description += ` at "${location}"`;

    return description;
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="flex flex-col bg-[#FAF0D7] gap-[20px] items-center justify-center text-center px-4 py-12 md:px-10 lg:px-40">
        <h1 className="text-3xl md:text-4xl font-bold">Search Quick Ticket</h1>
        <div className="w-full max-w-xl">
          <SearchBar />
        </div>
        <p className="text-lg">{getFilterDescription()}</p>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-40 py-8 bg-[#FAF0D7]">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : events.length === 0 ? (
          <p className="text-center py-8">
            No events found for "{searchQuery}"
          </p>
        ) : (
          <div className="flex flex-col divide-y">
            {events.map((event) => (
              <div
                key={event.id}
                className="py-6 flex flex-col md:flex-row gap-4"
              >
                <div className="md:w-1/4">
                  <img
                    src={`${cloudinaryBaseUrl}${event.event_image}`}
                    alt={event.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="md:w-3/4">
                  <Link href={`/events/${event.id}`}>
                    <h2 className="text-xl font-bold hover:text-blue-600 mb-2">
                      {event.name}
                    </h2>
                  </Link>
                  <p className="text-gray-600 mb-1">{event.location}</p>
                  <p className="text-gray-600 mb-3">
                    {formatEventDates(event.start_date, event.end_date)}
                  </p>
                  <Link href={`/events/${event.id}`}>
                    <p className="line-clamp-3 hover:text-blue-600">
                      {event.description || "No description available"}
                    </p>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
