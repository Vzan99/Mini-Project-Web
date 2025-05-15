"use client";

import Image from "next/image";
import BuyTicketButton from "@/components/buttons/BuyTicketButton";
import Link from "next/link";
import { cloudinaryBaseUrl } from "@/components/config/cloudinary";
import { IEventDetails } from "@/components/event/eventDetails/types";
import SocialMedia from "@/components/socialMedia";
import { formatDateDetails, formatTime } from "@/utils/formatters";

export default function EventDetailsPage({ event }: { event: IEventDetails }) {
  if (!event) {
    return <div>Loading event details...</div>;
  }

  const getImageUrl = () => {
    if (!event.event_image) {
      return "/images/placeholder.jpg";
    }
    return `${cloudinaryBaseUrl}${event.event_image}`;
  };

  const imageUrl = getImageUrl();

  // Get organizer full name
  const organizerName = event.organizer
    ? `${event.organizer.first_name} ${event.organizer.last_name}`
    : "Unknown Organizer";

  return (
    <main className="bg-white">
      {/* Hero section with event image */}
      <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] bg-gray-200">
        <Image
          src={imageUrl}
          alt={event.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
          }}
        />
        {/* Lighter overlay with gradient for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg px-2 md:px-10 lg:px-40">
              {event.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Event details section */}
      <div className="container mx-auto px-10 md:px-20 lg:px-40 py-8 ">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Event details */}
          <div className="lg:w-2/3">
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-2xl font-semibold mb-4">Event Details</h2>

              <div className="flex flex-col md:flex-row md:items-center gap-8 mb-6">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {formatDateDetails(event.start_date)}
                    </p>
                    {event.start_date !== event.end_date && (
                      <p className="font-medium">
                        to {formatDateDetails(event.end_date)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium">
                      {formatTime(event.start_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium capitalize">{event.category}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Organized by</p>
                <Link
                  href={`/eoDetails/${event.organizer_id}?id=${event.organizer_id}`}
                  className="font-medium hover:text-blue-600 hover:underline"
                >
                  {organizerName}
                </Link>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
              <div className="prose max-w-none">
                {event.description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                ) : (
                  <p className="text-gray-500">
                    No description available for this event.
                  </p>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Location</h2>
              <p className="mb-4">{event.location}</p>
            </div>
          </div>

          {/* Right column - Ticket information */}
          <div className="lg:w-1/3">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
              {event.remaining_seats > 0 ? (
                <>
                  {/* Simplified ticket section - only showing the button */}
                  <BuyTicketButton
                    eventId={event.id}
                    eventName={event.name}
                    quantity={1} // Fixed quantity of 1
                  />

                  {/* Social media sharing section */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-center font-medium mb-3">
                      Share this event!
                    </p>
                    <div className="flex justify-center">
                      <SocialMedia />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full py-4 bg-gray-400 text-white font-bold rounded-lg text-center mb-6">
                    Sold Out
                  </div>

                  {/* Social media sharing section */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-center font-medium mb-3">
                      Share the event!
                    </p>
                    <SocialMedia />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
