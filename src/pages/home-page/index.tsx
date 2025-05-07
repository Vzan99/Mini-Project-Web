import CreateSection from "./sections/create-section";
import EventsSection from "./sections/events-section";
import HeroSection from "./sections/hero-section";

export default function HomeViewPage() {
  return (
    <main>
      <HeroSection />
      <EventsSection />
      <CreateSection />
    </main>
  );
}
