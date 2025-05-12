"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { API_BASE_URL } from "@/components/config/api";
import { cloudinaryBaseUrl } from "@/components/config/cloudinary";
import { IEventDetails, IReviewFormValues } from "./components/types";
import { formatDate } from "@/utils/formatters";

// Review validation schema
const reviewValidationSchema = Yup.object({
  rating: Yup.number()
    .required("Rating is required")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),
  comment: Yup.string()
    .required("Review comment is required")
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment cannot exceed 500 characters"),
});

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams?.get("eventId") || "";
  const transactionId = searchParams?.get("transactionId") || "";

  const [event, setEvent] = useState<IEventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Initial form values
  const initialValues: IReviewFormValues = {
    rating: 0,
    comment: "",
  };

  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (!eventId || !transactionId) {
        setError("Missing event or transaction information");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch event details
        const eventResponse = await axios.get(
          `${API_BASE_URL}/events/${eventId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setEvent(eventResponse.data.data);

        // Fetch transaction to verify it's confirmed
        const transactionResponse = await axios.get(
          `${API_BASE_URL}/transactions/${transactionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const transaction = transactionResponse.data.data;

        // Check conditions:
        // 1. Transaction is confirmed
        // 2. Event has ended
        const isConfirmed = transaction.status === "confirmed";
        const eventEnded =
          new Date(eventResponse.data.data.end_date) < new Date();

        if (!isConfirmed) {
          setError("You can only review events with confirmed payments");
        } else if (!eventEnded) {
          setError("You can only review events that have already ended");
        } else {
          // Let the backend handle the duplicate review check
          setCanReview(true);
        }
      } catch (err: any) {
        console.error("Error checking review eligibility:", err);
        setError(err.response?.data?.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    checkReviewEligibility();
  }, [eventId, transactionId, router]);

  const handleSubmit = async (values: IReviewFormValues) => {
    if (!eventId) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Submit review without user_id - backend will extract it from token
      await axios.post(
        `${API_BASE_URL}/reviews`,
        {
          event_id: eventId,
          rating: values.rating,
          review: values.comment, // Backend expects 'review', not 'comment'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);

      // Redirect to event page after 2 seconds
      setTimeout(() => {
        router.push(`/events/${eventId}`);
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FAF0D7] min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-center">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FAF0D7] min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-4">Review Event</h1>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
            <button
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-[#FAF0D7] min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-4">Review Submitted</h1>
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Your review has been submitted successfully! Redirecting...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-[#FAF0D7] min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-center">Event not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF0D7] min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Review Event</h1>

          {/* Event details */}
          <div className="mb-6 flex items-center">
            <div className="w-24 h-24 relative mr-4 rounded-md overflow-hidden">
              <img
                src={`${cloudinaryBaseUrl}/${event.event_image}`}
                alt={event.name}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{event.name}</h2>
              <p className="text-gray-600">
                {formatDate(event.start_date)} - {formatDate(event.end_date)}
              </p>
              <p className="text-gray-600">{event.location}</p>
            </div>
          </div>

          {canReview ? (
            <Formik
              initialValues={initialValues}
              validationSchema={reviewValidationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-4">
                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating *
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFieldValue("rating", star)}
                          className="text-3xl focus:outline-none"
                        >
                          {star <= values.rating ? "★" : "☆"}
                        </button>
                      ))}
                    </div>
                    <ErrorMessage
                      name="rating"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Review Comment */}
                  <div>
                    <label
                      htmlFor="comment"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your Review *
                    </label>
                    <Field
                      as="textarea"
                      id="comment"
                      name="comment"
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Share your experience with this event..."
                    />
                    <ErrorMessage
                      name="comment"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {values.comment.length}/500 characters
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#222432] text-white px-4 py-2 rounded hover:bg-opacity-90"
                    >
                      {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              You are not eligible to review this event.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
