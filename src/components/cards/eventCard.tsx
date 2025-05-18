// src/components/cards/EventCard.tsx
import React from "react";
import Link from "next/link";

type EventCardProps = {
  id: string;
  name: string;
  event_image: string;
  location: string;
  start_date: string;
  end_date: string;
  cloudinaryBaseUrl: string;
};

function EventCard({
  id,
  name,
  event_image,
  location,
  start_date,
  end_date,
  cloudinaryBaseUrl,
}: EventCardProps) {
  const getFullImageUrl = (imageName: string) => {
    return imageName
      ? `${cloudinaryBaseUrl}${imageName}`
      : "https://via.placeholder.com/400x200"; // Default placeholder if no image
  };

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    };
    return new Date(date).toLocaleDateString("en-GB", options);
  };

  const formatEventDates = (start_date: string, end_date: string) => {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const startFormatted = formatDate(start_date);
    const endFormatted = formatDate(end_date);

    // Check if the event spans within the same month
    if (startDate.getMonth() === endDate.getMonth()) {
      // Only show day range without repeating the month
      return `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleString(
        "en-GB",
        { month: "long" }
      )} ${startDate.getFullYear()}`;
    } else {
      return `${startFormatted} - ${endFormatted}`;
    }
  };

  return (
    <div
      key={id}
      className="rounded-xl overflow-hidden shadow hover:shadow-lg bg-white transition"
    >
      <Link href={`/events/${id}`}>
        <img
          src={getFullImageUrl(event_image)} // Use full URL
          alt={name}
          className="w-full h-40 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link href={`/events/${id}`}>
          <h4 className="text-lg font-bold font-fraunces">{name}</h4>
        </Link>
        <p className="text-sm text-gray-500">{location}</p>
        <p className="text-sm text-gray-600 mt-1">
          {formatEventDates(start_date, end_date)}
        </p>
        <Link
          href={`/events/${id}`}
          className="text-sm text-black hover:text-blue-800 mt-2 inline-block underline"
        >
          Event details
        </Link>
      </div>
    </div>
  );
}

export default EventCard;
