"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { cloudinaryBaseUrl } from "@/app/components/config/cloudinary";
import EventCard from "@/app/components/cards/eventCard";

// Define types based on your updated backend response
type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    username: string;
  };
};

type EventSummary = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  price: number;
  totalSeats: number;
  remainingSeats: number;
  category: string;
  eventImage: string;
  totalReviews: number;
};

type OrganizerInfo = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
};

type OrganizerProfile = {
  organizer: OrganizerInfo;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  events: EventSummary[];
};

export default function EODetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizerId = searchParams?.get("id") || "";

  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizerId) {
      setError("No organizer ID provided");
      setLoading(false);
      return;
    }

    const fetchOrganizerProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/admin/organizers/${organizerId}`
        );
        setProfile(response.data.profile);
        console.log("Profile data:", response.data.profile);
      } catch (err: any) {
        console.error("Error fetching organizer profile:", err);
        setError(
          err.response?.data?.message || "Failed to load organizer profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizerProfile();
  }, [organizerId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!profile)
    return <div className="text-center py-10">No profile data found</div>;

  return (
    <div className="min-h-screen bg-[#FAF0D7]">
      <div className="container mx-auto px-4 md:px-10 lg:px-40 py-8">
        {/* Organizer Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
              {profile.organizer.profilePicture ? (
                <Image
                  src={`${cloudinaryBaseUrl}${profile.organizer.profilePicture}`}
                  alt="Organizer"
                  width={128}
                  height={128}
                  className="object-cover"
                  onError={(e) => {
                    console.error(
                      "Image failed to load:",
                      `${cloudinaryBaseUrl}${profile.organizer.profilePicture}`
                    );
                    // Remove the image on error and show the div background
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-gray-500 text-sm">Organizer</span>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">
                {profile.organizer.firstName} {profile.organizer.lastName}
              </h1>
              <p className="text-gray-600 mb-2">
                @{profile.organizer.username}
              </p>
              <div className="flex items-center justify-center md:justify-start mb-2">
                <span className="text-yellow-500 mr-1">★</span>
                <span>{profile.averageRating.toFixed(1)}</span>
                <span className="text-gray-500 ml-1">
                  ({profile.totalReviews} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>

          {profile.events.length === 0 ? (
            <p className="text-gray-500">No upcoming events</p>
          ) : (
            <>
              {/* Mobile and tablet view: Horizontal scroll */}
              <div className="block lg:hidden overflow-x-auto scrollbar-hide mb-4">
                <div className="flex gap-4 px-1 w-max">
                  {profile.events.map((event) => (
                    <div key={event.id} className="w-[280px] flex-shrink-0">
                      <EventCard
                        id={event.id}
                        name={event.name}
                        event_image={event.eventImage}
                        location={event.location}
                        start_date={event.startDate}
                        end_date={event.endDate}
                        cloudinaryBaseUrl={cloudinaryBaseUrl}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop view: grid layout */}
              <div className="hidden lg:grid gap-6 grid-cols-1 lg:grid-cols-3">
                {profile.events.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    name={event.name}
                    event_image={event.eventImage}
                    location={event.location}
                    start_date={event.startDate}
                    end_date={event.endDate}
                    cloudinaryBaseUrl={cloudinaryBaseUrl}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Reviews</h2>

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
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
