"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/components/config/api";
import { cloudinaryBaseUrl } from "@/components/config/cloudinary";
import { formatDate } from "@/utils/formatters";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { IPastEvent, IPagination } from "@/components/past-events/types";
import { reviewValidationSchema } from "@/components/past-events/schemas";
import LoadingSpinnerScreen from "@/components/loadings/loadingSpinnerScreen";

export default function PastEventsPage() {
  const router = useRouter();
  const [pastEvents, setPastEvents] = useState<IPastEvent[]>([]);
  const [pagination, setPagination] = useState<IPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchPastEvents(1);
  }, []);

  const fetchPastEvents = async (pageNum: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios({
        method: "get",
        url: `${API_BASE_URL}/events/past`,
        params: {
          page: pageNum,
          limit: 10,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = response.data.data;
      setPastEvents(responseData.events);
      setPagination(responseData.pagination);
    } catch (err) {
      console.error("Error fetching past events:", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load past events");
      } else {
        setError("Failed to load past events");
      }
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string) => {
    return imagePath
      ? `${cloudinaryBaseUrl}/${imagePath}`
      : "https://via.placeholder.com/400x400";
  };

  const handlePageChange = (newPage: number) => {
    fetchPastEvents(newPage);
  };

  const toggleReviewForm = (eventId: string) => {
    setExpandedReviewId(expandedReviewId === eventId ? null : eventId);
  };

  const submitReview = async (
    values: { rating: number; comment: string },
    eventId: string,
    transactionId: string
  ) => {
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      await axios.post(
        `${API_BASE_URL}/reviews`,
        {
          event_id: eventId,
          rating: values.rating,
          review: values.comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh the events list to update the review status
      fetchPastEvents(pagination?.currentPage || 1);
      setExpandedReviewId(null);
    } catch (err) {
      console.error("Error submitting review:", err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to submit review");
      } else {
        alert("Failed to submit review");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return LoadingSpinnerScreen();

  if (error) {
    return (
      <div className="bg-[#FAF0D7] min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Past Events</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF0D7] min-h-screen py-8">
      <div className="container mx-auto px-5 md:px-10 lg:px-40">
        <h1 className="text-3xl font-bold mb-6">Past Events</h1>

        {pastEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              You haven't attended any events yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                {/* Event Image with View Ticket button overlay */}
                <div className="relative">
                  <Link href={`/events/${event.id}`}>
                    <div className="relative w-full h-48">
                      <Image
                        src={getImageUrl(event.event_image)}
                        alt={event.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: "cover" }}
                        className="cursor-pointer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/400x400";
                        }}
                      />
                    </div>
                  </Link>

                  {/* View Ticket button - top right corner */}
                  {event.transactions && event.transactions.length > 0 ? (
                    <Link
                      href={`/tickets/${event.transactions[0].id}`}
                      className="absolute top-2 right-2 bg-white text-blue-600 hover:text-blue-800 py-1 px-3 rounded-md shadow-md text-sm font-medium"
                    >
                      View Ticket
                    </Link>
                  ) : null}
                </div>

                {/* Event Details */}
                <div className="p-4">
                  <Link href={`/events/${event.id}`}>
                    <h3 className="font-bold text-lg hover:text-blue-600 cursor-pointer">
                      {event.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 mt-1">
                    Date: {formatDate(event.end_date)}
                  </p>
                  <p className="text-gray-600">Location: {event.location}</p>

                  {/* Review Section */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {event.review && event.review.length > 0 ? (
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium mr-2">
                            Your Rating:
                          </span>
                          <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>
                                {i < event.review[0].rating ? "★" : "☆"}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 italic">
                          "{event.review[0].comment || event.review[0].review}"
                        </p>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          onClick={() => toggleReviewForm(event.id)}
                          className="bg-[#222432] text-white py-1 px-3 rounded-md hover:bg-opacity-90 text-sm"
                        >
                          Write Review
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Review Form - Slides down when expanded */}
                  {expandedReviewId === event.id &&
                    (!event.review || event.review.length === 0) && (
                      <div className="mt-4 pt-4 border-t border-gray-200 transition-all duration-300 ease-in-out">
                        <Formik
                          initialValues={{ rating: 3, comment: "" }}
                          validationSchema={reviewValidationSchema}
                          onSubmit={(values) =>
                            submitReview(
                              values,
                              event.id,
                              event.transactions[0]?.id || ""
                            )
                          }
                        >
                          {({ values, setFieldValue }) => (
                            <Form className="space-y-4">
                              {/* Star Rating */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Rating
                                </label>
                                <div className="flex space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() =>
                                        setFieldValue("rating", star)
                                      }
                                      className="text-2xl focus:outline-none"
                                    >
                                      {star <= values.rating ? (
                                        <span className="text-yellow-500">
                                          ★
                                        </span>
                                      ) : (
                                        <span className="text-yellow-500">
                                          ☆
                                        </span>
                                      )}
                                    </button>
                                  ))}
                                </div>
                                <ErrorMessage
                                  name="rating"
                                  component="div"
                                  className="text-red-500 text-xs mt-1"
                                />
                              </div>

                              {/* Review Comment */}
                              <div>
                                <Field
                                  as="textarea"
                                  id="comment"
                                  name="comment"
                                  rows={3}
                                  className="w-full px-3 py-2 border rounded-md text-sm"
                                  placeholder="Share your experience with this event..."
                                />
                                <ErrorMessage
                                  name="comment"
                                  component="div"
                                  className="text-red-500 text-xs mt-1"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  {values.comment.length}/500 characters
                                </div>
                              </div>

                              {/* Submit Button */}
                              <div className="flex justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedReviewId(null)}
                                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={submittingReview}
                                  className="bg-[#222432] text-white px-3 py-1 rounded text-sm hover:bg-opacity-90"
                                >
                                  {submittingReview
                                    ? "Submitting..."
                                    : "Submit"}
                                </button>
                              </div>
                            </Form>
                          )}
                        </Formik>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="inline-flex rounded-md shadow">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 rounded-l-md border ${
                  pagination.currentPage === 1
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border-t border-b ${
                    pagination.currentPage === page
                      ? "bg-[#222432] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1 rounded-r-md border ${
                  pagination.currentPage === pagination.totalPages
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
