"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import {
  EventFormValues,
  eventInitialValues,
  eventValidationSchema,
} from "@/schemas/eventCreateSchema";
import { API_BASE_URL } from "@/components/config/api";

// Add this function to generate time options in hourly intervals (24-hour format)
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourFormatted = hour.toString().padStart(2, "0");
    const time = `${hourFormatted}:00`;
    // Format for display (24-hour format)
    const displayTime = `${hourFormatted}:00`;
    options.push({ value: time, label: displayTime });
  }
  return options;
};

// Create the time options array
const timeOptions = generateTimeOptions();

export default function EventCreatePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Combine date and time fields when submitting
  const getCombinedDateTimeValues = (values: EventFormValues) => {
    const combinedData = { ...values };

    // Combine start date and time
    if (values.startDate && values.startTime) {
      const startDateTime = `${values.startDate}T${values.startTime}`;
      combinedData.startDate = startDateTime;
    }

    // Combine end date and time
    if (values.endDate && values.endTime) {
      const endDateTime = `${values.endDate}T${values.endTime}`;
      combinedData.endDate = endDateTime;
    }

    return combinedData;
  };

  const handleSubmit = async (
    values: EventFormValues,
    { setSubmitting }: FormikHelpers<EventFormValues>
  ) => {
    setError("");

    try {
      // Get combined date/time values
      const combinedData = getCombinedDateTimeValues(values);

      // Create FormData object for multipart/form-data submission
      const submitData = new FormData();

      // Add all form fields to FormData (excluding separate time fields)
      Object.entries(combinedData).forEach(([key, value]) => {
        // Skip the time-only fields since we've combined them
        if (key !== "startTime" && key !== "endTime") {
          submitData.append(key, value.toString());
        }
      });

      // Add image file if selected
      if (imageFile) {
        submitData.append("eventImage", imageFile);
      }

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to create an event");
      }

      // Submit the form data
      const response = await axios.post(`${API_BASE_URL}/events`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Redirect to the event page on success
      router.push(`/events/${response.data.data.id}`);
    } catch (err: any) {
      console.error("Error creating event:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create event. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF0D7] min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-[#222432]">
          Create New Event
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Formik
          initialValues={eventInitialValues}
          validationSchema={eventValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-6 bg-white p-6 rounded-lg shadow-md">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Event Name *
                </label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  maxLength={100}
                  className={`w-full px-3 py-2 border rounded-md bg-white ${
                    errors.name && touched.name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Start Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Date *
                  </label>
                  <Field
                    type="date"
                    id="startDate"
                    name="startDate"
                    className={`w-full px-3 py-2 border rounded-md bg-white h-[38px] ${
                      errors.startDate && touched.startDate
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="startDate"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Time *
                  </label>
                  <Field
                    as="select"
                    id="startTime"
                    name="startTime"
                    className={`w-full px-3 py-2 border rounded-md bg-white h-[38px] ${
                      errors.startTime && touched.startTime
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select time</option>
                    {timeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="startTime"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              {/* End Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Date *
                  </label>
                  <Field
                    type="date"
                    id="endDate"
                    name="endDate"
                    className={`w-full px-3 py-2 border rounded-md bg-white h-[38px] ${
                      errors.endDate && touched.endDate
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="endDate"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Time *
                  </label>
                  <Field
                    as="select"
                    id="endTime"
                    name="endTime"
                    className={`w-full px-3 py-2 border rounded-md bg-white h-[38px] ${
                      errors.endTime && touched.endTime
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select time</option>
                    {timeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="endTime"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description *
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={5}
                  maxLength={2000}
                  className={`w-full px-3 py-2 border rounded-md bg-white ${
                    errors.description && touched.description
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location *
                </label>
                <Field
                  type="text"
                  id="location"
                  name="location"
                  maxLength={100}
                  className={`w-full px-3 py-2 border rounded-md bg-white ${
                    errors.location && touched.location
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <ErrorMessage
                  name="location"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price (IDR) *
                  </label>
                  <Field
                    type="number"
                    id="price"
                    name="price"
                    min={0}
                    className={`w-full px-3 py-2 border rounded-md bg-white ${
                      errors.price && touched.price
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="totalSeats"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Total Seats *
                  </label>
                  <Field
                    type="number"
                    id="totalSeats"
                    name="totalSeats"
                    min={1}
                    className={`w-full px-3 py-2 border rounded-md bg-white ${
                      errors.totalSeats && touched.totalSeats
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="totalSeats"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category *
                  </label>
                  <Field
                    as="select"
                    id="category"
                    name="category"
                    className={`w-full px-3 py-2 border rounded-md bg-white ${
                      errors.category && touched.category
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="concert">Concert</option>
                    <option value="festival">Festival</option>
                    <option value="comedy">Comedy</option>
                    <option value="museum">Museum</option>
                    <option value="others">Others</option>
                  </Field>
                  <ErrorMessage
                    name="category"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-40 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="buttonA"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="buttonB"
                >
                  {isSubmitting ? "Creating..." : "Create Event"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
