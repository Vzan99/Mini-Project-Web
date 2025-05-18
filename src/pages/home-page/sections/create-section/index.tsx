import Link from "next/link";

export default function CreateSection() {
  return (
    <section className="bg-[#FAF0D7] py-20 px-4 text-center text-black h-[80vh] flex justify-center items-center">
      <div className="flex flex-col lg:px-40">
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-semibold mb-6 font-fraunces">
          Powering seamless ticketing for organizers everywhere.
        </h2>
        <Link href="/events/create">
          <button className="buttonB mx-auto">Create Event Now!</button>
        </Link>
      </div>
    </section>
  );
}
