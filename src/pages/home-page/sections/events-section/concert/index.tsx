import { useEffect, useState } from "react";
import EventCard from "@/app/components/cards/eventCard";
import { Event } from "@/app/types/event";
// import Button from "@/app/components/buttons";

type SectionProps = {
  category: string;
};

export default function ConcertSection({ category }: SectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const cloudinaryBaseUrl =
    "https://res.cloudinary.com/dnb5cxo2m/image/upload/";

  useEffect(() => {
    fetch(`http://localhost:8000/admin/sections?category=${category}`)
      .then((res) => res.json())
      .then((res) => setEvents(res.data[0]?.events || []))
      .catch((err) => console.error("Failed to fetch events:", err))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <section className="py-10 px-4 md:px-10 lg:px-40 bg-[#FFD9C0] text-black">
      {/* Title + Button layout */}
      <div className="mb-8">
        {/* Tablet and desktop layout */}
        <div className="hidden md:flex justify-between items-center">
          <h2 className="text-2xl font-bold">{category}s</h2>
          <button className="buttonA">View More</button>
        </div>

        {/* Mobile layout: title only */}
        <div className="md:hidden mb-4 text-center">
          <h2 className="text-2xl font-bold">Concerts</h2>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500">No events found.</p>
      ) : (
        <>
          {/* Mobile view: Horizontal scroll */}
          <div className="block md:hidden overflow-x-auto scrollbar-hide mb-4">
            <div className="flex gap-4 px-1 w-max">
              {events.map((event) => (
                <div key={event.id} className="w-[280px] flex-shrink-0">
                  <EventCard
                    id={event.id}
                    name={event.name}
                    event_image={event.event_image}
                    location={event.location}
                    start_date={event.start_date}
                    end_date={event.end_date}
                    cloudinaryBaseUrl={cloudinaryBaseUrl}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile button below carousel */}
          <div className="md:hidden text-center mb-6 flex justify-center">
            <button className="buttonA">View More</button>
          </div>

          {/* Desktop/tablet view: grid layout */}
          <div className="hidden md:grid gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                name={event.name}
                event_image={event.event_image}
                location={event.location}
                start_date={event.start_date}
                end_date={event.end_date}
                cloudinaryBaseUrl={cloudinaryBaseUrl}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
