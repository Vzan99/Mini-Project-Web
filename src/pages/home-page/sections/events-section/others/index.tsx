import { useEffect, useState } from "react";
import EventCard from "@/components/cards/eventCard";
import { IEventCard } from "@/components/home/sections/types";
import axios from "axios";
import Link from "next/link";
import { cloudinaryBaseUrl } from "@/components/config/cloudinary";
import { API_BASE_URL } from "@/components/config/api";
import LoadingSpinner from "@/components/loadings/loadingSpinner"; // Import the spinner component

export default function OthersSection() {
  const [events, setEvents] = useState<IEventCard[]>([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const sectionTitle = "Others";

  const fetchEvents = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/sections?category=Others`
      );

      const eventDetails = response.data.data || [];

      if (eventDetails.length >= 0) {
        setEvents(eventDetails);
      } else {
        console.error("others events is not an array:", eventDetails);
        setEvents([]);
      }
    } catch (err) {
      console.error("Error fetching others events:", err);
      setEvents([]);
    } finally {
      setLoading(false); // Hide spinner after fetch completes
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <section
      className="py-10 px-4 md:px-10 lg:px-40 bg-[#FFD9C0] text-black"
      data-section="others"
      id="others"
    >
      <div className="mb-8">
        {/* Tablet and desktop layout */}
        <div className="hidden md:flex justify-between items-center">
          <h2 className="text-2xl font-bold">{sectionTitle}</h2>
          <Link href="/discover?category=Others">
            <button className="buttonA">View More</button>
          </Link>
        </div>

        {/* Mobile layout: title only */}
        <div className="md:hidden mb-4 text-center">
          <h2 className="text-2xl font-bold">{sectionTitle}</h2>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <LoadingSpinner /> {/* Show spinner while loading */}
        </div>
      ) : (
        <>
          {/* Mobile view: Horizontal scroll */}
          <div className="block md:hidden overflow-x-auto scrollbar-hide mb-4">
            <div className="flex gap-4 px-1 w-max">
              {events?.map((event) => (
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
            <Link href="/discover?category=Others">
              <button className="buttonA">View More</button>
            </Link>
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
