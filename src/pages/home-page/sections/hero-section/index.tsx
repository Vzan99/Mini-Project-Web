import SearchBar from "@/components/searchbar";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative flex flex-col min-h-screen bg-[#FAF0D7] gap-[20px] items-center justify-center text-center px-4 md:px-10 lg:px-40 overflow-hidden">
      {/* Background: desktop-only left image */}
      <div
        className="absolute w-[650px] h-[500px] bg-cover bg-no-repeat opacity-40 pointer-events-none hidden lg:block"
        style={{
          backgroundImage: `url('/home-bg-festivals.png')`,
          bottom: "0",
          left: "0",
        }}
      />

      {/* Background: bottom-right image (all screens) */}
      <div
        className="absolute w-[500px] h-[500px] bg-cover bg-no-repeat opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url('/home-bg-ferris-wheel.png')`,
          bottom: "0",
          right: "0",
        }}
      />

      {/* Main content */}
      <h1 className="title z-10">Get In. Get Going. Get Tickets</h1>
      <p className="sub-title z-10">Seamless Tickets, Zero Hassle.</p>
      <div className="mt-6 w-full max-w-xl flex flex-col justify-center items-center gap-4 z-10">
        <SearchBar />
        <Link href="/discover">
          <button className="buttonB mt-4 px-8">Discover All Events!</button>
        </Link>
      </div>
    </section>
  );
}
