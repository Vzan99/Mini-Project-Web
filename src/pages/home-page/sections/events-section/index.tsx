"use client";
import ComedySection from "./comedy";
import ConcertSection from "./concert";
import FestivalSection from "./festival";
import MuseumSection from "./museum";
import OtherSection from "./others";

export default function EventsSection() {
  return (
    <div>
      <ConcertSection />
      <FestivalSection />
      <ComedySection />
      <MuseumSection />
      <OtherSection />
    </div>
  );
}
