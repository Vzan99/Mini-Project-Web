"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import {
  EventFormValues,
  eventInitialValues,
  eventValidationSchema,
} from "./components/schema";
import { API_BASE_URL } from "@/components/config/api";
import { formatNumberWithCommas } from "@/utils/formatters";
import { generateTimeOptions } from "@/utils/formatters";

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

      // Add all form fields to FormData with correct field names
      submitData.append("name", combinedData.name);
      submitData.append("startDate", combinedData.start_date); // Already combined date+time
      submitData.append("endDate", combinedData.end_date); // Already combined date+time
      submitData.append("description", combinedData.description);
      submitData.append("location", combinedData.location);
      submitData.append("price", combinedData.price.toString());
      submitData.append("totalSeats", combinedData.total_seats.toString());
      submitData.append("category", combinedData.category); // Remove .toLowerCase()

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

      // If voucher creation is enabled and event is paid, create voucher
      if (values.create_voucher && values.price > 0) {
        const eventId = response.data.data.id;

        // Combine voucher dates and times
        const voucherStartDateTime = `${values.voucher_start_date}T${values.voucher_start_time}`;
        const voucherEndDateTime = `${values.voucher_end_date}T${values.voucher_end_time}`;

        // Create voucher
        await axios.post(
          `${API_BASE_URL}/vouchers`,
          {
            eventId,
            voucherCode: values.voucher_code,
            discountAmount: values.discount_amount,
            voucherStartDate: new Date(voucherStartDateTime),
            voucherEndDate: new Date(voucherEndDateTime),
            maxUsage: values.max_usage,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

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
                      errors.start_date && touched.start_date
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
                      errors.end_date && touched.end_date
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
                    Price * (IDR)
                  </label>
                  <Field
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md bg-white ${
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
                      errors.total_seats && touched.total_seats
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

              <div className="mt-8 border-t pt-6">
                <h3 className="text-xl font-semibold mb-4">
                  Voucher Information
                </h3>

                {/* Voucher checkbox - disabled for free events */}
                <div className="mb-4">
                  <div className="flex items-center">
                    <Field
                      type="checkbox"
                      id="createVoucher"
                      name="createVoucher"
                      className="mr-2 h-4 w-4"
                      disabled={values.price <= 0}
                    />
                    <label
                      htmlFor="createVoucher"
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

                {/* Voucher fields - only shown when checkbox is checked */}
                {values.create_voucher && values.price > 0 && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                    <div>
                      <label
                        htmlFor="voucherCode"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Voucher Code *
                      </label>
                      <Field
                        type="text"
                        id="voucherCode"
                        name="voucherCode"
                        className={`w-full px-3 py-2 border rounded-md bg-white ${
                          errors.voucher_code && touched.voucher_code
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <ErrorMessage
                        name="voucherCode"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="discountAmount"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Discount Amount * (max: {formatPrice(values.price)})
                      </label>
                      <Field
                        type="number"
                        id="discountAmount"
                        name="discountAmount"
                        min="1"
                        max={values.price}
                        className={`w-full px-3 py-2 border rounded-md bg-white ${
                          errors.discount_amount && touched.discount_amount
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <ErrorMessage
                        name="discountAmount"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="voucherStartDate"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Voucher Start Date *
                        </label>
                        <Field
                          type="date"
                          id="voucherStartDate"
                          name="voucherStartDate"
                          min={values.start_date}
                          className={`w-full px-3 py-2 border rounded-md bg-white ${
                            errors.voucher_start_date &&
                            touched.voucher_start_date
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        <ErrorMessage
                          name="voucherStartDate"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="voucherStartTime"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Voucher Start Time *
                        </label>
                        <Field
                          as="select"
                          id="voucherStartTime"
                          name="voucherStartTime"
                          className={`w-full px-3 py-2 border rounded-md bg-white h-[38px] ${
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
                          name="voucherStartTime"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="voucherEndDate"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Voucher End Date *
                        </label>
                        <Field
                          type="date"
                          id="voucherEndDate"
                          name="voucherEndDate"
                          min={values.voucher_start_date || values.start_date}
                          max={values.end_date}
                          className={`w-full px-3 py-2 border rounded-md bg-white ${
                            errors.voucher_end_date && touched.voucher_end_date
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        <ErrorMessage
                          name="voucherEndDate"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="voucherEndTime"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Voucher End Time *
                        </label>
                        <Field
                          as="select"
                          id="voucherEndTime"
                          name="voucherEndTime"
                          className={`w-full px-3 py-2 border rounded-md bg-white h-[38px] ${
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
                          name="voucherEndTime"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="maxUsage"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Max Usage * (max: {values.total_seats})
                      </label>
                      <Field
                        type="number"
                        id="maxUsage"
                        name="maxUsage"
                        min="1"
                        max={values.total_seats}
                        className={`w-full px-3 py-2 border rounded-md bg-white ${
                          errors.max_usage && touched.max_usage
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <ErrorMessage
                        name="maxUsage"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
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
