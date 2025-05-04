"use client";
import ComedySection from "./comedy";
import ConcertSection from "./concert";
import FestivalSection from "./festival";
import MuseumSection from "./museum";
import OtherSection from "./others";

export default function EventsSection() {
  return (
    <div>
      <ConcertSection category="Concert" />
      <FestivalSection category="Festival" />
      <ComedySection category="Comedy" />
      <MuseumSection category="Museum" />
      <OtherSection category="Others" />
    </div>
  );
}
