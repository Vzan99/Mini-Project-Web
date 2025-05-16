"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import {
  eventInitialValues,
  eventValidationSchema,
} from "@/components/event/eventCreate/schema";
import { IEventFormValues } from "@/components/event/eventCreate/types";
import { API_BASE_URL } from "@/components/config/api";
import { formatNumberWithCommas } from "@/utils/formatters";
import { generateTimeOptions } from "@/utils/formatters";

const timeOptions = generateTimeOptions();

// Add this function to properly format dates for HTML date inputs
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
};

// Get tomorrow's date for min attribute
const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  return formatDateForInput(tomorrow);
};

const getTodayDateString = () => {
  const date = new Date();
  date.setDate(date.getDate());
  return formatDateForInput(date);
};

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
  const getCombinedDateTimeValues = (values: IEventFormValues) => {
    const combinedData = { ...values };

    try {
      // Combine start date and time with proper ISO format
      if (values.start_date && values.start_time) {
        const startDateTime = new Date(
          `${values.start_date}T${values.start_time}`
        ).toISOString();
        combinedData.start_date = startDateTime;
      }

      // Combine end date and time with proper ISO format
      if (values.end_date && values.end_time) {
        const endDateTime = new Date(
          `${values.end_date}T${values.end_time}`
        ).toISOString();
        combinedData.end_date = endDateTime;
      }

      return combinedData;
    } catch (error) {
      console.error("Error combining date and time values:", error);
      throw new Error("Invalid date or time format. Please check your inputs.");
    }
  };

  // Validate voucher dates against event dates
  const validateVoucherDates = (values: IEventFormValues) => {
    if (!values.create_voucher || values.price <= 0) return true;

    try {
      // Create Date objects for event dates
      const eventStart = new Date(`${values.start_date}T${values.start_time}`);
      const eventEnd = new Date(`${values.end_date}T${values.end_time}`);

      // Create Date objects for voucher dates
      const voucherStart = new Date(
        `${values.voucher_start_date}T${values.voucher_start_time}`
      );
      const voucherEnd = new Date(
        `${values.voucher_end_date}T${values.voucher_end_time}`
      );

      // Allow voucher to start from yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0); // Start of yesterday

      // Check if voucher start is at least yesterday
      if (voucherStart < yesterday) {
        setError("Voucher start date cannot be earlier than yesterday");
        return false;
      }

      // Check if voucher end is before event end
      if (voucherEnd > eventEnd) {
        setError(
          "Voucher end date/time must be on or before event end date/time"
        );
        return false;
      }

      // Check if voucher end is after voucher start
      if (voucherEnd <= voucherStart) {
        setError("Voucher end date/time must be after voucher start date/time");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Date validation error:", error);
      setError("Invalid date format. Please check all dates and times.");
      return false;
    }
  };

  const handleSubmit = async (
    values: IEventFormValues,
    { setSubmitting }: FormikHelpers<IEventFormValues>
  ) => {
    setError("");

    // Validate voucher dates if creating a voucher
    if (values.create_voucher && values.price > 0) {
      if (!validateVoucherDates(values)) {
        setSubmitting(false);
        return;
      }
    }

    try {
      // Create FormData object for multipart/form-data submission
      const submitData = new FormData();

      // Parse dates correctly
      const startDateTime = new Date(
        `${values.start_date}T${values.start_time}`
      );
      const endDateTime = new Date(`${values.end_date}T${values.end_time}`);

      // Add all form fields to FormData with correct field names matching backend
      submitData.append("name", values.name);
      submitData.append("start_date", startDateTime.toISOString());
      submitData.append("end_date", endDateTime.toISOString());
      submitData.append("description", values.description);
      submitData.append("location", values.location);
      submitData.append("price", values.price.toString());
      submitData.append("total_seats", values.total_seats.toString());
      submitData.append("category", values.category);

      // Add image file with correct field name
      if (imageFile) {
        submitData.append("eventImage", imageFile);
      }

      // Log the form data for debugging
      console.log("Form data:", Object.fromEntries(submitData.entries()));

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

      console.log("Event creation successful:", response.data);

      // If voucher creation is enabled and event is paid, create voucher
      if (values.create_voucher && values.price > 0) {
        try {
          const eventId = response.data.data.id;

          // Combine voucher dates and times with proper ISO format
          const voucherStartDateTime = new Date(
            `${values.voucher_start_date}T${values.voucher_start_time}`
          );
          const voucherEndDateTime = new Date(
            `${values.voucher_end_date}T${values.voucher_end_time}`
          );

          console.log("Voucher payload being sent:", {
            event_id: eventId,
            voucher_code: values.voucher_code,
            discount_amount: values.discount_amount,
            voucher_start_date: voucherStartDateTime.toISOString(),
            voucher_end_date: voucherEndDateTime.toISOString(),
            max_usage: values.max_usage,
          });

          // Create voucher with snake_case field names to match backend
          await axios.post(
            `${API_BASE_URL}/vouchers`,
            {
              event_id: eventId,
              voucher_code: values.voucher_code,
              discount_amount: values.discount_amount,
              voucher_start_date: voucherStartDateTime.toISOString(),
              voucher_end_date: voucherEndDateTime.toISOString(),
              max_usage: values.max_usage,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        } catch (voucherErr: any) {
          console.error("Error creating voucher:", voucherErr);
          // alert(
          //   voucherErr.response?.data?.message ||
          //     "Failed to create voucher. Please try again."
          // );
          const details = voucherErr.response?.data?.details;
          if (details && Array.isArray(details)) {
            // Combine all field error messages into one alert
            const messages = details
              .map((d) => `${d.path.join(".")} - ${d.message}`)
              .join("\n");
            alert(messages);
          } else {
            alert(
              voucherErr.response?.data?.message ||
                "Failed to create voucher. Please try again."
            );
          }
        }
      }

      // Redirect to the event page on success
      router.push(`/events/${response.data.data.id}`);
    } catch (err: any) {
      console.error("Error creating event:", err);

      // More detailed error logging
      if (axios.isAxiosError(err)) {
        console.error("Response status:", err.response?.status);
        console.error("Response data:", err.response?.data);

        // Check if there are validation details
        if (
          err.response?.data?.details &&
          Array.isArray(err.response.data.details)
        ) {
          console.error("Validation details:", err.response.data.details);
        }
      }

      setError(
        err.response?.data?.message ||
          "Failed to create event. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Add this function to format price with commas
  const formatPrice = (price: number) => {
    return formatNumberWithCommas(price);
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
          {({ isSubmitting, errors, touched, values }) => (
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
                    htmlFor="start_date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Date *
                  </label>
                  <Field
                    type="date"
                    id="start_date"
                    name="start_date"
                    min={getTomorrowDateString()}
                    className={`w-full px-3 py-2 border rounded-md bg-white h-[42px] ${
                      errors.start_date && touched.start_date
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="start_date"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="start_time"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Start Time *
                  </label>
                  <Field
                    as="select"
                    id="start_time"
                    name="start_time"
                    className={`w-full px-3 py-2 border rounded-md bg-white h-[42px] ${
                      errors.start_time && touched.start_time
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
                    name="start_time"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              {/* End Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="end_date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Date *
                  </label>
                  <Field
                    type="date"
                    id="end_date"
                    name="end_date"
                    min={getTomorrowDateString()}
                    className={`w-full px-3 py-2 border rounded-md bg-white h-[42px] ${
                      errors.end_date && touched.end_date
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="end_date"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="end_time"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Time *
                  </label>
                  <Field
                    as="select"
                    id="end_time"
                    name="end_time"
                    className={`w-full px-3 py-2 border rounded-md bg-white h-[42px] ${
                      errors.end_time && touched.end_time
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
                    name="end_time"
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

              {/* Price, Total Seats, and Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price * (IDR)
                  </label>
                  <Field
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md bg-white h-[42px] ${
                      errors.price && touched.price
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {values.price > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      Formatted: IDR {formatPrice(values.price)}
                    </div>
                  )}
                  <ErrorMessage
                    name="price"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="total_seats"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Total Seats *
                  </label>
                  <Field
                    type="number"
                    id="total_seats"
                    name="total_seats"
                    min={1}
                    className={`w-full px-3 py-2 border rounded-md bg-white h-[42px] ${
                      errors.total_seats && touched.total_seats
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <ErrorMessage
                    name="total_seats"
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
                    className={`w-full px-3 py-2 border rounded-md bg-white h-[42px] ${
                      errors.category && touched.category
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="Concert">Concert</option>
                    <option value="Festival">Festival</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Museum">Museum</option>
                    <option value="Others">Others</option>
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

              {/* Voucher checkbox */}
              <div className="mb-4">
                <div className="flex items-center">
                  <Field
                    type="checkbox"
                    id="create_voucher"
                    name="create_voucher"
                    className="mr-2 h-4 w-4"
                    disabled={values.price <= 0}
                  />
                  <label
                    htmlFor="create_voucher"
                    className={`text-sm font-medium ${
                      values.price <= 0 ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    Create voucher for this event
                  </label>
                  {values.price <= 0 && (
                    <span className="ml-2 text-xs text-red-500">
                      (Only available for paid events)
                    </span>
                  )}
                </div>
              </div>

              {/* Voucher fields */}
              {values.create_voucher && values.price > 0 && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                  <div>
                    <label
                      htmlFor="voucher_code"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Voucher Code *
                    </label>
                    <Field
                      type="text"
                      id="voucher_code"
                      name="voucher_code"
                      className={`w-full px-3 py-2 border rounded-md bg-white ${
                        errors.voucher_code && touched.voucher_code
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <ErrorMessage
                      name="voucher_code"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="discount_amount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Discount Amount * (max: {formatPrice(values.price)})
                    </label>
                    <Field
                      type="number"
                      id="discount_amount"
                      name="discount_amount"
                      min="1"
                      max={values.price}
                      className={`w-full px-3 py-2 border rounded-md bg-white ${
                        errors.discount_amount && touched.discount_amount
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <ErrorMessage
                      name="discount_amount"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="voucher_start_date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Voucher Start Date *
                      </label>
                      <Field
                        type="date"
                        id="voucher_start_date"
                        name="voucher_start_date"
                        min={getTomorrowDateString()}
                        max={values.end_date} // Cannot be after event end date
                        className={`w-full px-3 py-2 border rounded-md bg-white h-[42px] ${
                          errors.voucher_start_date &&
                          touched.voucher_start_date
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <ErrorMessage
                        name="voucher_start_date"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="voucher_start_time"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Voucher Start Time *
                      </label>
                      <Field
                        as="select"
                        id="voucher_start_time"
                        name="voucher_start_time"
                        className={`w-full px-3 py-2 border rounded-md bg-white h-[42px] ${
                          errors.voucher_start_time &&
                          touched.voucher_start_time
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
                        name="voucher_start_time"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="voucher_end_date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Voucher End Date *
                      </label>
                      <Field
                        type="date"
                        id="voucher_end_date"
                        name="voucher_end_date"
                        min={values.voucher_start_date || values.start_date} // Must be after voucher start date
                        max={values.end_date} // Cannot be after event end date
                        className={`w-full px-3 py-2 border rounded-md bg-white h-[42px] ${
                          errors.voucher_end_date && touched.voucher_end_date
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <ErrorMessage
                        name="voucher_end_date"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="voucher_end_time"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Voucher End Time *
                      </label>
                      <Field
                        as="select"
                        id="voucher_end_time"
                        name="voucher_end_time"
                        className={`w-full px-3 py-2 border rounded-md bg-white h-[42px] ${
                          errors.voucher_end_time && touched.voucher_end_time
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
                        name="voucher_end_time"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="max_usage"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Max Usage * (max: {values.total_seats})
                    </label>
                    <Field
                      type="number"
                      id="max_usage"
                      name="max_usage"
                      min="1"
                      max={values.total_seats}
                      className={`w-full px-3 py-2 border rounded-md bg-white ${
                        errors.max_usage && touched.max_usage
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <ErrorMessage
                      name="max_usage"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
              )}
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
