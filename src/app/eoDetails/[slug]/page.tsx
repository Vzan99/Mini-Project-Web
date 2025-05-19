"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { cloudinaryBaseUrl } from "@/components/config/cloudinary";
import EventCard from "@/components/cards/eventCard";
import Link from "next/link";
import LoadingSpinnerScreen from "@/components/loadings/loadingSpinnerScreen";
import { API_BASE_URL } from "@/components/config/api";
import { IOrganizerProfile, IEventSummary } from "@/components/eoDetails/types";
import { formatDate } from "@/utils/formatters";

export default function EODetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<IOrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<IEventSummary[]>([]);
  const [pastEvents, setPastEvents] = useState<IEventSummary[]>([]);

  async function fetchUser() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/organizers/${slug}`
      );

      console.log("API response:", response.data);

      if (!response.data || !response.data.profile) {
        throw new Error("Invalid response from server");
      }

      const prof: IOrganizerProfile = response.data.profile;
      setProfile(prof);

      const now = new Date();
      setUpcomingEvents(prof.events.filter((e) => new Date(e.end_date) >= now));
      setPastEvents(prof.events.filter((e) => new Date(e.end_date) < now));
    } catch (err: any) {
      console.error("Fetch user error:", err);
      setError(
        err.response?.data?.message ?? err.message ?? "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) return <LoadingSpinnerScreen />;
  if (error)
    return <div className="text-red-500 py-10 text-center">{error}</div>;
  if (!profile) return <div className="py-10 text-center">No profile data</div>;

  return (
    <div className="min-h-screen bg-[#FAF0D7]">
      <div className="container mx-auto px-4 md:px-10 lg:px-40 py-8">
        {/* Organizer Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
              {profile.organizer.profile_picture ? (
                <Image
                  src={`${cloudinaryBaseUrl}${profile.organizer.profile_picture}`}
                  alt="Organizer"
                  width={128}
                  height={128}
                  className="object-cover"
                  onError={(e) => {
                    console.error(
                      "Image failed to load:",
                      `${cloudinaryBaseUrl}${profile.organizer.profile_picture}`
                    );
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-gray-500 text-sm">Organizer</span>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2 font-fraunces">
                {profile.organizer.first_name} {profile.organizer.last_name}
              </h1>
              <p className="text-gray-600 mb-2">
                @{profile.organizer.username}
              </p>
              <div className="flex items-center justify-center md:justify-start mb-2">
                <span className="text-yellow-500 mr-1">★</span>
                <span>{profile.average_rating.toFixed(1)}</span>
                <span className="text-gray-500 ml-1">
                  ({profile.total_reviews} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 font-fraunces">
            Upcoming Events
          </h2>

          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500">No upcoming events</p>
          ) : (
            <>
              {/* Mobile and tablet view: Horizontal scroll */}
              <div className="block lg:hidden overflow-x-auto scrollbar-hide mb-4">
                <div className="flex gap-4 px-1 w-max">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="w-[280px] flex-shrink-0">
                      <EventCard
                        id={event.id}
                        name={event.name}
                        event_image={event.event_image}
                        location={event.location}
                        start_date={event.start_date}
                        end_date={event.end_date}
                        cloudinaryBaseUrl={cloudinaryBaseUrl}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop view: grid layout */}
              <div className="hidden lg:grid gap-6 grid-cols-1 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    name={event.name}
                    event_image={event.event_image}
                    location={event.location}
                    start_date={event.start_date}
                    end_date={event.end_date}
                    cloudinaryBaseUrl={cloudinaryBaseUrl}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Past Events Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 font-fraunces">Past Events</h2>

          {pastEvents.length === 0 ? (
            <p className="text-gray-500">No past events</p>
          ) : (
            <>
              {/* Mobile and tablet view: Horizontal scroll */}
              <div className="block lg:hidden overflow-x-auto scrollbar-hide mb-4">
                <div className="flex gap-4 px-1 w-max">
                  {pastEvents.map((event) => (
                    <div key={event.id} className="w-[280px] flex-shrink-0">
                      <EventCard
                        id={event.id}
                        name={event.name}
                        event_image={event.event_image}
                        location={event.location}
                        start_date={event.start_date}
                        end_date={event.end_date}
                        cloudinaryBaseUrl={cloudinaryBaseUrl}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop view: grid layout */}
              <div className="hidden lg:grid gap-6 grid-cols-1 lg:grid-cols-3">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    name={event.name}
                    event_image={event.event_image}
                    location={event.location}
                    start_date={event.start_date}
                    end_date={event.end_date}
                    cloudinaryBaseUrl={cloudinaryBaseUrl}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 font-fraunces">Reviews</h2>

          {profile.reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {profile.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center mb-2">
                    <span className="font-medium mr-2">
                      {review.user.username}
                    </span>
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm ml-2">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  {/* Show which event this review is for if available */}
                  {review.event_name && (
                    <p className="text-sm text-black mb-1">
                      <Link href={`/events/${review.event_id}`}>
                        Review for: {review.event_name}
                      </Link>
                    </p>
                  )}
                  <p className="text-gray-700">{review.review}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
