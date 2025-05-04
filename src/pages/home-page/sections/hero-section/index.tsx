import SearchBar from "@/app/components/searchbar";

export default function HeroSection() {
  return (
    <section className="flex flex-col min-h-screen bg-[#FAF0D7] gap-[20px] items-center justify-center text-center px-4 md:px-10 lg:px-40">
      <h1 className="title">Get In. Get Going. Get Tickets</h1>
      <p className="sub-title">Seamless Tickets, Zero Hassle.</p>
      <div className="mt-6 w-full max-w-xl flex justify-center items-center">
        <SearchBar />
      </div>
    </section>
  );
}
