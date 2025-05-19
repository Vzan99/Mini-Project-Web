// src/components/cards/EventCard.tsx
import React from "react";
import Link from "next/link";
import { formatEventDates } from "@/utils/formatters";

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
      : "https://via.placeholder.com/400x200";
  };

  return (
    <div
      key={id}
      className="rounded-xl overflow-hidden shadow hover:shadow-lg bg-white transition"
    >
      <Link href={`/events/${id}`}>
        <img
          src={getFullImageUrl(event_image)}
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
