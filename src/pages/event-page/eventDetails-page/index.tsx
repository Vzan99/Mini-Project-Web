"use client"; // Add this to make it a client component if you're using interactive features

import { useState } from "react";
import Image from "next/image";
import BuyTicketButton from "@/app/components/buttons/BuyTicketButton";
import Link from "next/link";

// Define the Event type based on your backend API response
type Organizer = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
};

type Transaction = {
  id: string;
  // Add other transaction fields as needed
};

type Voucher = {
  id: string;
  // Add other voucher fields as needed
};

type Review = {
  id: string;
  // Add other review fields as needed
};

type Event = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  description: string;
  event_image: string;
  location: string;
  price: number;
  total_seats: number;
  remaining_seats: number;
  category: string;
  organizer_id: string;
  organizer: Organizer;
  transactions: Transaction[];
  voucher: Voucher[];
  review: Review[];
  created_at?: string;
  updated_at?: string;
};

export default function EventDetailsPage({ event }: { event: Event }) {
  // Add state for ticket quantity
  const [ticketQuantity, setTicketQuantity] = useState(1);

  // Function to handle quantity changes
  const handleQuantityChange = (newQuantity: number) => {
    // Ensure quantity is between 1 and 3 (the backend limit)
    if (newQuantity >= 1 && newQuantity <= 3) {
      setTicketQuantity(newQuantity);
    }
  };

  // Add some validation to prevent runtime errors
  if (!event) {
    return <div>Loading event details...</div>;
  }

  // Improved image URL handling
  const cloudinaryBaseUrl =
    "https://res.cloudinary.com/dnb5cxo2m/image/upload/";

  // More robust image URL construction
  // Improved image URL handling
  const getImageUrl = () => {
    if (!event.event_image) {
      return "/images/placeholder.jpg"; // Fallback to placeholder
    }

    // Since you only store the filename in the database,
    // always construct the full Cloudinary URL
    return `${cloudinaryBaseUrl}${event.event_image}`;
  };

  const imageUrl = getImageUrl();

  console.log("Event image path:", event.event_image);
  console.log("Constructed image URL:", imageUrl);

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(date).toLocaleDateString("en-GB", options);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

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
            console.error("Image failed to load:", imageUrl);
            console.error("Image error details:", e);
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
                      {formatDate(event.start_date)}
                    </p>
                    {event.start_date !== event.end_date && (
                      <p className="font-medium">
                        to {formatDate(event.end_date)}
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
              {/* You can add a map component here if you have coordinates */}
            </div>

            {event.review && event.review.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
                {/* Implement reviews display here */}
                <p className="text-gray-500">
                  This event has {event.review.length} reviews.
                </p>
              </div>
            )}
          </div>

          {/* Right column - Ticket information */}
          <div className="lg:w-1/3">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
              <h2 className="text-2xl font-semibold mb-4">Tickets</h2>

              <p className="text-3xl font-bold mb-6">
                {formatPrice(event.price)}
              </p>

              {event.remaining_seats > 0 ? (
                <>
                  {/* Ticket quantity selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Tickets (Max 3)
                    </label>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleQuantityChange(ticketQuantity - 1)}
                        disabled={ticketQuantity <= 1}
                        className="px-3 py-1 bg-[#222432] rounded-l-md disabled:opacity-50 text-white"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 bg-white border-t border-b text-center w-12">
                        {ticketQuantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(ticketQuantity + 1)}
                        disabled={
                          ticketQuantity >= 3 ||
                          ticketQuantity >= event.remaining_seats
                        }
                        className="px-3 py-1 bg-[#222432] rounded-r-md disabled:opacity-50 text-white"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    {event.remaining_seats < 3 && (
                      <p className="text-xs text-orange-600 mt-1">
                        Only {event.remaining_seats} seats remaining
                      </p>
                    )}
                  </div>

                  {/* Total price calculation */}
                  <div className="mb-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Price per ticket:
                      </span>
                      <span className="text-sm font-medium">
                        {formatPrice(event.price)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className="text-sm font-medium">
                        {ticketQuantity}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-base font-semibold">Total:</span>
                      <span className="text-base font-bold">
                        {formatPrice(event.price * ticketQuantity)}
                      </span>
                    </div>
                  </div>

                  <BuyTicketButton
                    eventId={event.id}
                    eventName={event.name}
                    quantity={ticketQuantity}
                  />

                  {event.voucher && event.voucher.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-blue-800">
                        Vouchers available for this event!
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full py-4 bg-gray-400 text-white font-bold rounded-lg text-center">
                  Sold Out
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
