import Image from "next/image";

export default function AboutUs() {
  return (
    <section className="bg-[#FAF0D7] text-black px-4 py-20 lg:px-32 flex flex-col gap-12 items-center justify-center">
      {/* Text Section */}
      <div className="max-w-4xl text-left space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold font-fraunces text-center">
          About Quick Ticket
        </h1>

        <p className="text-justify">
          Quick Ticket is a modern event management platform designed to
          simplify the way events are created, discovered, and attended. Whether
          you're an event organizer planning your next big gathering or an
          attendee looking for exciting experiences, Quick Ticket offers a
          seamless, all-in-one solution to manage and explore events
          effortlessly.
        </p>

        <p className="text-justify">
          At its core, Quick Ticket empowers organizers to create detailed event
          listings that include essential information such as event name,
          pricing (both free and paid options), start and end dates, ticket
          types, seat availability, and descriptions. Organizers can also boost
          visibility with time-limited voucher promotions. The event listing
          page is fully responsive, and users can quickly find events with
          category/location filters and a search bar enhanced with debounce
          functionality.
        </p>

        <p className="text-justify">
          Attendees benefit from a straightforward ticket purchasing process.
          After selecting tickets, users are given a 2-hour window to upload
          proof of payment, or the transaction expires automatically—restoring
          seats and any used rewards like points or coupons. Organizers must
          confirm or reject transactions within 3 days, after which the system
          handles cancellations automatically. All payments are in Indonesian
          Rupiah (IDR), ensuring local relevance.
        </p>

        <p className="text-justify">
          Quick Ticket’s referral system promotes social sharing and rewards
          users with discount coupons and point bonuses. Each referral earns the
          inviter 10,000 points, and both coupons and points are valid for 3
          months. Users can manage their referrals, balances, and profile
          info—including password and profile pictures—through a clean,
          user-friendly dashboard.
        </p>

        <p className="text-justify">
          Reviews and ratings can only be posted by verified event attendees,
          enhancing platform trust. Organizers get access to a powerful
          dashboard to manage events, view attendee lists, monitor transactions,
          and see data visualized by day, month, or year. Email notifications
          ensure that users stay updated on their transaction statuses.
        </p>

        <p className="text-justify">
          Every feature in Quick Ticket is designed with user experience and
          data integrity in mind. We support protected routing, SQL transactions
          for multi-step updates, responsive design, empty-state handling,
          confirmation popups, and complete role-based access control. Inspired
          by platforms like Eventbrite and Ticket Tailor, Quick Ticket brings
          global event management standards to Indonesia—simple, powerful, and
          purpose-built for both organizers and attendees.
        </p>
      </div>
    </section>
  );
}
