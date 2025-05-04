// "use client";

// import { useRouter } from "next/navigation";
// export default function CreateSection() {
//   const router = useRouter();

//   const handleClick = () => {
//     router.push("/events/create");
//   };

//   return (
//     <div>
//       <div className="flex flex-col h-screen md:h-screen lg:h-screen bg-[#FAF0D7] gap-[20px] items-center justify-center px-[50px] md:px-[150px] lg:px-[250px]">
//         <h2 className="text-xl md:text-4xl lg:text-7xl text-[#222432] font-semibold text-center">
//           Powering seamless ticketing for organizers everywhere.
//         </h2>
//         <button className="buttonB" onClick={handleClick}>
//           Create Event Now!
//         </button>
//       </div>
//     </div>
//   );
// }

// src/pages/home-page/sections/create-section/index.tsx

import Link from "next/link";

export default function CreateSection() {
  return (
    <section className="bg-[#FAF0D7] py-20 px-4 text-center text-black">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">
          Powering seamless ticketing for organizers everywhere.
        </h2>
        <Link href="/events/create">
          <button className="buttonB mx-auto">Create Event Now!</button>
        </Link>
      </div>
    </section>
  );
}
