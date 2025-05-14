"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { API_BASE_URL } from "@/components/config/api";
import {
  TransactionFormValues,
  IEventDetails,
} from "@/components/transactions/types";
import { formatNumberWithCommas } from "@/utils/formatters";
import {
  transactionInitialValues,
  transactionValidationSchema,
} from "@/components/transactions/schema";
// Add Redux imports - only what we need
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setCurrentTransaction,
  clearCurrentTransaction,
  setTransactionForm,
  applyVoucher,
  applyCoupon,
  applyPoints,
  setCalculatedTotal,
  setSubtotal, // Add this import
} from "@/lib/redux/features/transactionSlice";
import LoadingSpinnerScreen from "@/components/loadings/loadingSpinnerScreen";

export default function TransactionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Add Redux dispatch
  const dispatch = useAppDispatch();

  // Get current transaction from Redux
  const {
    transactionForm,
    calculatedTotal,
    discounts: reduxDiscounts,
  } = useAppSelector((state) => state.transaction);

  // State variables
  const [event, setEvent] = useState<IEventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availablePoints, setAvailablePoints] = useState(0);
  const [vouchers, setVouchers] = useState([]);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [voucherId, setVoucherId] = useState<string | null>(null);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [pointsId, setPointsId] = useState<string | null>(null);

  // Enhanced validation for query parameters
  const validateAndGetParams = () => {
    if (!searchParams) {
      console.error("No search parameters available");
      return { eventId: null, isValid: false };
    }

    const eventId = searchParams.get("eventId");

    // Validate eventId format (UUID)
    const isValidEventId =
      eventId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        eventId
      );

    return {
      eventId,
      isValid: isValidEventId,
    };
  };

  const { eventId, isValid: areParamsValid } = validateAndGetParams();

  // Clear any existing transaction when the page loads
  useEffect(() => {
    dispatch(clearCurrentTransaction());
  }, [dispatch]);

  // Toggle description function
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  // Redirect if parameters are invalid
  useEffect(() => {
    if (!areParamsValid) {
      console.error("Invalid parameters detected, redirecting to events page");
      setError("Invalid event parameters. Redirecting to events page...");

      // Set a timeout to allow the error message to be seen
      const redirectTimer = setTimeout(() => {
        router.push("/events");
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [areParamsValid, router]);

  // Format the start date if event exists
  const formattedStartDate = event ? event.start_date : "";

  // Initial form values with start date
  const initialValues = useMemo(() => {
    // Make sure we have a valid start date
    let startDate = "";
    if (event && event.start_date) {
      startDate = event.start_date;
    }
    // Always use quantity 1 as default
    return transactionInitialValues(eventId || "", 1, startDate);
  }, [event, eventId]);

  // Validation schema
  const validationSchema = transactionValidationSchema(availablePoints);

  // Fetch event details and user points
  useEffect(() => {
    if (!eventId) return;

    const fetchEventDetails = async () => {
      setLoading(true);

      try {
        const response = await axios.get(`${API_BASE_URL}/events/${eventId}`);
        setEvent(response.data.data);

        // Fetch user points with the correct endpoint
        try {
          const token = localStorage.getItem("token");
          if (token) {
            // Update the endpoint to match your backend
            const userResponse = await axios.get(
              `${API_BASE_URL}/profile/with-points`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            // Adjust this based on your actual response structure
            setAvailablePoints(
              userResponse.data.data.points.totalActivePoints || 0
            );
          }
        } catch (profileErr) {
          console.log("Could not fetch user profile:", profileErr);
          // Set default points to 0 and continue - don't let this error block the checkout
          setAvailablePoints(0);
        }

        setLoading(false);
      } catch (err) {
        console.error("Full error object:", err);

        if (axios.isAxiosError(err)) {
          console.log("Status:", err.response?.status);
          console.log("Response data:", err.response?.data);
          console.log("Request config:", err.config);
        }

        let errorMessage =
          "Failed to load event details. Please try again later.";
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          errorMessage =
            "Event not found. It may have been deleted or the ID is incorrect.";
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // Generate available dates between event start and end
  const getAvailableDates = () => {
    if (!event) return [];

    const dates = [];
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      dates.push(new Date(date));
    }

    return dates;
  };

  // Check voucher validity
  const checkVoucher = async (code: string) => {
    if (!code || code.trim() === "") {
      alert("Please enter a voucher code");
      return false;
    }

    try {
      setError("");
      console.log(`Checking voucher code: ${code} for event: ${eventId}`);

      if (!eventId) {
        alert("Invalid event ID");
        return false;
      }

      const response = await axios.get(`${API_BASE_URL}/vouchers/check`, {
        params: {
          event_id: eventId, // Changed from eventId to event_id to match backend expectation
          voucher_code: code,
        },
      });

      console.log("Voucher check response:", response.data);

      if (
        response.data &&
        response.data.data &&
        response.data.data.is_valid === true // Changed from isValid to is_valid to match backend
      ) {
        setVoucherDiscount(response.data.data.discount_amount); // Changed from discountAmount to discount_amount
        setVoucherId(response.data.data.voucher_id); // Changed from voucherId to voucher_id
        alert(
          `Voucher applied successfully! Discount: ${formatNumberWithCommas(
            response.data.data.discount_amount
          )}`
        );
        return true;
      } else {
        setVoucherDiscount(0);
        setVoucherId(null);
        alert(response.data.data.message || "Voucher is not valid");
        return false;
      }
    } catch (err: any) {
      console.error("Error checking voucher:", err);
      setVoucherDiscount(0);
      setVoucherId(null);

      let errorMessage = "Invalid or expired voucher code";
      if (err.response) {
        console.log("Error response data:", err.response.data);
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      alert(errorMessage);
      return false;
    }
  };

  const checkCoupon = async (code: string) => {
    if (!code || code.trim() === "") {
      alert("Please enter a coupon code");
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to use coupons");
        return false;
      }

      const userResponse = await axios.get(
        `${API_BASE_URL}/profile/with-points`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userId = userResponse.data.data.id;

      if (
        !userId ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          userId
        )
      ) {
        alert("Invalid user ID format");
        return false;
      }

      const response = await axios.get(`${API_BASE_URL}/coupon/check`, {
        params: {
          userId: userId,
          coupon_code: code,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Coupon check response:", response.data);

      if (
        response.data &&
        response.data.data &&
        response.data.data.isValid === true
      ) {
        setCouponDiscount(response.data.data.discountAmount);
        setCouponId(response.data.data.id); // Store the coupon ID
        alert(
          `Coupon applied successfully! Discount: ${formatNumberWithCommas(
            response.data.data.discountAmount
          )}`
        );
        return true;
      } else if (
        response.data &&
        response.data.data &&
        !response.data.data.isValid
      ) {
        setCouponDiscount(0);
        setCouponId(null);
        alert(response.data.data.message || "Coupon is not valid");
        return false;
      } else {
        console.warn("Unexpected response format:", response.data);
        setCouponDiscount(0);
        setCouponId(null);
        alert("Unable to apply coupon. Invalid response format.");
        return false;
      }
    } catch (err: any) {
      console.error("Error checking coupon:", err);
      setCouponDiscount(0);
      setCouponId(null);

      let errorMessage = "Invalid or expired coupon code";
      if (err.response) {
        console.log("Error response data:", err.response.data);
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        if (
          err.response.data &&
          err.response.data.details &&
          Array.isArray(err.response.data.details)
        ) {
          const validationDetails = err.response.data.details;
          errorMessage = `Validation failed: ${validationDetails
            .map((detail: { message: string }) => detail.message)
            .join(", ")}`;
        }
      }
      alert(errorMessage);
      return false;
    }
  };

  // Add function to fetch points ID when user toggles points usage
  const fetchPointsId = async (pointsAmount: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const userResponse = await axios.get(
        `${API_BASE_URL}/profile/with-points`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const userId = userResponse.data.data.id;

      // Get points ID for the specified amount
      const response = await axios.get(`${API_BASE_URL}/points/available`, {
        params: { userId, amount: pointsAmount },
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data.id;
    } catch (err) {
      console.error("Error fetching points ID:", err);
      return null;
    }
  };

  // Update the points toggle handler
  const handlePointsToggle = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: any
  ) => {
    const usePoints = e.target.checked;
    setFieldValue("use_points", usePoints); // Changed from "usePoints"

    if (usePoints && availablePoints > 0) {
      setFieldValue("points_to_use", availablePoints); // Changed from "pointsToUse"
      // Fetch and store points ID
      const id = await fetchPointsId(availablePoints);
      setPointsId(id);
    } else {
      setFieldValue("points_to_use", 0); // Changed from "pointsToUse"
      setPointsId(null);
    }
  };

  // Calculate total price
  const calculateTotal = (values: TransactionFormValues) => {
    if (!event) return 0;

    const subtotal = event.price * values.quantity;
    let discount = 0;

    if (values.use_voucher) discount += reduxDiscounts.voucherDiscount;
    if (values.use_coupon) discount += reduxDiscounts.couponDiscount;
    if (values.use_points) discount += reduxDiscounts.pointsUsed;

    const total = Math.max(0, subtotal - discount);

    // Don't dispatch during render - just return the calculated value
    return total;
  };

  // Add this useEffect to update the Redux state when relevant values change
  useEffect(() => {
    if (event && transactionForm) {
      const subtotal = event.price * transactionForm.quantity;
      dispatch(setSubtotal(subtotal));

      let discount = 0;

      if (transactionForm.use_voucher)
        discount += reduxDiscounts.voucherDiscount;
      if (transactionForm.use_coupon) discount += reduxDiscounts.couponDiscount;
      if (transactionForm.use_points) discount += reduxDiscounts.pointsUsed;

      const total = Math.max(0, subtotal - discount);
      dispatch(setCalculatedTotal(total));
    }
  }, [
    event,
    transactionForm,
    reduxDiscounts.voucherDiscount,
    reduxDiscounts.couponDiscount,
    reduxDiscounts.pointsUsed,
    dispatch,
  ]);

  // Update the Redux state when discounts change
  useEffect(() => {
    if (event) {
      // Update Redux with the current discount values
      if (voucherId && voucherDiscount > 0) {
        dispatch(applyVoucher({ id: voucherId, amount: voucherDiscount }));
      }

      if (couponId && couponDiscount > 0) {
        dispatch(applyCoupon({ id: couponId, amount: couponDiscount }));
      }

      if (pointsId && availablePoints > 0) {
        dispatch(applyPoints(availablePoints));
      }
    }
  }, [
    voucherId,
    voucherDiscount,
    couponId,
    couponDiscount,
    pointsId,
    availablePoints,
    dispatch,
    event,
  ]);

  // Handle form submission
  const handleSubmit = async (values: TransactionFormValues) => {
    // Save form values to Redux first
    dispatch(setTransactionForm(values));

    // Calculate final values before submission
    const subtotal = event?.price ? event.price * values.quantity : 0;
    dispatch(setSubtotal(subtotal)); // Store subtotal in Redux for consistent order summary
    const total = calculateTotal(values);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login?redirect=transaction");
        return;
      }

      // Make sure we have an event
      if (!event) {
        setError("Event data is missing");
        return;
      }

      // Use the selected date or fall back to event start date
      const attendDate = values.attend_date || event.start_date;

      // Create payload
      const payload = {
        event_id: values.event_id,
        quantity: values.quantity,
        attend_date: values.attend_date,
        payment_method: values.payment_method,
        // Include voucher data properly
        ...(values.use_voucher && voucherId
          ? {
              voucher_id: voucherId, // Changed from voucherId to voucher_id
              voucher_code: values.voucher_code,
              voucher_discount: voucherDiscount,
            }
          : {}),
        ...(values.use_coupon && couponId
          ? {
              coupon_id: couponId, // Use snake_case for backend consistency
              coupon_code: values.coupon_code,
              coupon_discount: couponDiscount,
            }
          : {}),
        ...(values.use_points && pointsId
          ? {
              points_id: pointsId, // Use snake_case for backend consistency
              points_used: availablePoints,
            }
          : {}),
        // Include calculated values
        subtotal: subtotal,
        total_price: total,
      };

      console.log("Submitting transaction with payload:", payload);

      // Submit the form data
      const response = await axios.post(
        `${API_BASE_URL}/transactions`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Transaction created successfully:", response.data);
      const transactionData = response.data.data;

      // Store transaction in Redux - make sure this is working
      console.log("Storing transaction in Redux:", transactionData);
      dispatch(setCurrentTransaction(transactionData));

      // Show success alert
      alert("Transaction created successfully! Redirecting to payment page...");

      // Add a small delay to ensure the transaction is committed and alert is seen
      setTimeout(() => {
        // Log the transaction ID before redirecting
        console.log(
          "Redirecting to payment confirmation with ID:",
          transactionData.id
        );
        router.push(`/payment/confirmation/${transactionData.id}`);
      }, 1000);
    } catch (err: any) {
      console.error("Transaction error:", err);

      // Show detailed error message
      let errorMessage = "Failed to process transaction";

      if (err.response) {
        console.log("Error response:", err.response);
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }

      setError(errorMessage);
      alert(errorMessage);
    }
  };

  // Add this function to format dates like "24 - 25 May 2025"
  const formatEventDates = (start_date: string, end_date: string) => {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Check if the event spans within the same month
    if (
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()
    ) {
      // Only show day range without repeating the month
      return `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleString(
        "en-GB",
        { month: "long" }
      )} ${startDate.getFullYear()}`;
    } else {
      // Different months or years
      const formatDate = (date: Date) => {
        return `${date.getDate()} ${date.toLocaleString("en-GB", {
          month: "long",
        })} ${date.getFullYear()}`;
      };
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
  };

  if (loading) return LoadingSpinnerScreen();
  if (error)
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!event)
    return (
      <div className="container mx-auto p-4 h-[75vh] bg-[#FAF0D7] flex justify-center items-center">
        <div className="flex flex-col gap-5">
          <p>Event Not Found.</p>
          <button onClick={() => router.push("/")} className="buttonA">
            Return to Home
          </button>
        </div>
      </div>
    );

  // Add this function to check if there's an unapplied discount code
  const hasUnappliedDiscountCode = (values: TransactionFormValues) => {
    // Check if there's text in voucher field but no voucher discount applied
    if (
      values.use_voucher && // Changed from values.useVoucher
      values.voucher_code && // Changed from values.voucherCode
      values.voucher_code.trim() !== "" &&
      voucherDiscount === 0
    ) {
      return true;
    }

    // Check if there's text in coupon field but no coupon discount applied
    if (
      values.use_coupon && // Changed from values.useCoupon
      values.coupon_code && // Changed from values.couponCode
      values.coupon_code.trim() !== "" &&
      couponDiscount === 0
    ) {
      return true;
    }

    return false;
  };

  return (
    <div className="bg-[#FAF0D7] min-h-screen py-4 md:py-6 lg:py-8">
      <div className="container mx-auto px-4 md:px-6 lg:px-100">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
          Complete Your Purchase
        </h1>

        {/* Main content */}
        <div className="w-full">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4">
            {/* Event summary header */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div>
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold">
                  {event.name}
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  {event.location}
                </p>
                <p className="text-sm md:text-base text-gray-600 mt-1">
                  {formatEventDates(event.start_date, event.end_date)}
                </p>

                <div className="mt-2 md:mt-3">
                  <div className="flex flex-wrap items-center">
                    <p className="text-xs md:text-sm text-gray-500 mr-1">
                      Organized by:
                    </p>
                    <p className="text-xs md:text-sm font-medium">
                      {event.organizer?.first_name} {event.organizer?.last_name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">
              Purchase Details
            </h2>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                values,
                setFieldValue,
                isSubmitting,
                errors,
                touched,
                isValid,
              }) => (
                <Form className="bg-white rounded-lg shadow-md p-4 md:p-6">
                  <div className="space-y-4 md:space-y-6">
                    {/* Quantity selector */}
                    <div className="border-2 border-gray-700 rounded-xl p-3 md:p-4 w-full mb-4 md:mb-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                        <div>
                          <h3 className="text-base md:text-lg font-semibold">
                            {event.name} Ticket
                          </h3>
                          <p className="mt-1 md:mt-2 text-gray-900 text-sm md:text-base">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                            }).format(event.price)}
                            <span className="text-xs md:text-sm text-gray-500 ml-1">
                              per ticket
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (values.quantity > 1) {
                                setFieldValue("quantity", values.quantity - 1);
                              }
                            }}
                            className="bg-[#222432] px-3 py-1 rounded text-lg text-white cursor-pointer"
                            disabled={values.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="text-lg font-medium w-6 text-center">
                            {values.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                values.quantity < 3 &&
                                values.quantity < event.remaining_seats
                              ) {
                                setFieldValue("quantity", values.quantity + 1);
                              }
                            }}
                            className="bg-[#222432] px-3 py-1 rounded text-lg text-white cursor-pointer"
                            disabled={
                              values.quantity >= 3 ||
                              values.quantity >= event.remaining_seats
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-gray-300 my-2 md:my-3"></div>

                      <div className="flex justify-between items-center mt-2 md:mt-4">
                        <span className="text-xs md:text-sm font-medium">
                          Total
                        </span>
                        <div className="text-right">
                          <p className="text-sm md:text-base font-semibold">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                            }).format(event.price * values.quantity)}
                          </p>
                          {event.remaining_seats < 10 && (
                            <p className="text-xs text-orange-600">
                              Only {event.remaining_seats} seats remaining
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Maximum ticket limit statement */}
                      <p className="text-xs text-gray-500 mt-2 md:mt-3">
                        Note: Maximum 3 tickets can be purchased in a single
                        payment.
                      </p>

                      <ErrorMessage
                        name="quantity"
                        component="div"
                        className="text-red-500 text-xs md:text-sm mt-1"
                      />
                    </div>

                    {/* Attend date selector with popup */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Date to Attend
                      </label>

                      <div className="relative">
                        {/* Date display and toggle button */}
                        <button
                          type="button"
                          onClick={() => setShowCalendar(!showCalendar)}
                          className="w-full px-4 py-2 border rounded-md bg-white flex justify-between items-center"
                        >
                          <span>
                            {values.attend_date
                              ? new Date(values.attend_date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  }
                                )
                              : "Select a date"}
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {/* Calendar popup */}
                        {showCalendar && (
                          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                            <div className="p-2">
                              <Calendar
                                onChange={(date) => {
                                  if (date instanceof Date) {
                                    // Format date as YYYY-MM-DD
                                    const year = date.getFullYear();
                                    const month = String(
                                      date.getMonth() + 1
                                    ).padStart(2, "0");
                                    const day = String(date.getDate()).padStart(
                                      2,
                                      "0"
                                    );

                                    // Simple ISO date string
                                    const dateString = `${year}-${month}-${day}`;

                                    setFieldValue("attend_date", dateString); // Changed from "attendDate"
                                    setShowCalendar(false); // Close calendar after selection
                                  }
                                }}
                                value={
                                  values.attend_date
                                    ? new Date(values.attend_date)
                                    : null
                                }
                                tileDisabled={({ date }) => {
                                  if (
                                    !event ||
                                    !event.start_date ||
                                    !event.end_date
                                  )
                                    return true;

                                  // Only enable dates between event start and end dates
                                  const eventStart = new Date(event.start_date);
                                  const eventEnd = new Date(event.end_date);

                                  eventStart.setHours(0, 0, 0, 0);
                                  eventEnd.setHours(23, 59, 59, 999);
                                  return date < eventStart || date > eventEnd;
                                }}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <ErrorMessage
                        name="attend_date" // Changed from "attendDate"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Discount options */}
                    <div className="space-y-4 border-t border-gray-200 pt-4">
                      <h3 className="text-lg font-semibold mb-3">Discounts</h3>

                      {/* Combined voucher/coupon selector with responsive layout */}
                      <div className="flex flex-col space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="mb-3 sm:mb-0">
                            <select
                              className={`px-4 py-2 border rounded-md ${
                                (values.use_voucher && voucherDiscount > 0) ||
                                (values.use_coupon && couponDiscount > 0)
                                  ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                                  : "bg-white"
                              }`}
                              value={
                                values.use_voucher
                                  ? "voucher"
                                  : values.use_coupon
                                  ? "coupon"
                                  : "voucher" // Default to voucher
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                setFieldValue(
                                  "use_voucher",
                                  value === "voucher"
                                );
                                setFieldValue("use_coupon", value === "coupon");
                                // Clear any previously entered codes
                                setFieldValue("voucher_code", "");
                                setFieldValue("coupon_code", "");
                                setVoucherDiscount(0);
                                setCouponDiscount(0);
                              }}
                              disabled={
                                (values.use_voucher && voucherDiscount > 0) ||
                                (values.use_coupon && couponDiscount > 0)
                              }
                            >
                              <option value="voucher">Event Voucher</option>
                              <option value="coupon">User Coupon</option>
                            </select>
                          </div>

                          <div className="w-full sm:w-1/2">
                            <div className="flex gap-2">
                              <Field
                                type="text"
                                name={
                                  values.use_voucher
                                    ? "voucher_code" // Changed from "voucherCode"
                                    : values.use_coupon
                                    ? "coupon_code" // Changed from "couponCode"
                                    : "voucher_code" // Changed from "voucherCode"
                                }
                                value={
                                  values.use_voucher
                                    ? values.voucher_code || ""
                                    : values.use_coupon
                                    ? values.coupon_code || ""
                                    : values.voucher_code || ""
                                }
                                placeholder={
                                  values.use_voucher
                                    ? "Enter voucher code (optional)"
                                    : values.use_coupon
                                    ? "Enter coupon code (optional)"
                                    : "Enter voucher code (optional)"
                                }
                                disabled={
                                  (values.use_voucher && voucherDiscount > 0) ||
                                  (values.use_coupon && couponDiscount > 0)
                                }
                                className={`w-full px-3 py-2 border rounded-md ${
                                  (values.use_voucher && voucherDiscount > 0) ||
                                  (values.use_coupon && couponDiscount > 0)
                                    ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-60"
                                    : "bg-white"
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  values.use_voucher
                                    ? checkVoucher(values.voucher_code)
                                    : checkCoupon(values.coupon_code)
                                }
                                disabled={
                                  (values.use_voucher &&
                                    (!values.voucher_code ||
                                      values.voucher_code.trim() === "") &&
                                    voucherDiscount === 0) ||
                                  (values.use_coupon &&
                                    (!values.coupon_code ||
                                      values.coupon_code.trim() === "") &&
                                    couponDiscount === 0) ||
                                  (values.use_voucher && voucherDiscount > 0) ||
                                  (values.use_coupon && couponDiscount > 0)
                                }
                                className={`px-3 py-2 rounded-md ${
                                  (values.use_voucher &&
                                    (!values.voucher_code ||
                                      values.voucher_code.trim() === "") &&
                                    voucherDiscount === 0) ||
                                  (values.use_coupon &&
                                    (!values.coupon_code ||
                                      values.coupon_code.trim() === "") &&
                                    couponDiscount === 0) ||
                                  (values.use_voucher && voucherDiscount > 0) ||
                                  (values.use_coupon && couponDiscount > 0)
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                                    : "bg-[#222432] text-white hover:bg-gray-800 cursor-pointer"
                                }`}
                              >
                                {(values.use_voucher && voucherDiscount > 0) ||
                                (values.use_coupon && couponDiscount > 0)
                                  ? "Applied"
                                  : "Apply"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Success message in its own row */}
                        <div>
                          {values.use_voucher && voucherDiscount > 0 && (
                            <div className="text-sm text-green-600 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Voucher applied successfully!
                            </div>
                          )}

                          {values.use_coupon && couponDiscount > 0 && (
                            <div className="text-sm text-green-600 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Coupon applied successfully!
                            </div>
                          )}
                        </div>

                        {/* Error messages */}
                        <div>
                          {values.use_voucher && (
                            <ErrorMessage
                              name="voucher_code"
                              component="div"
                              className="text-red-500 text-sm"
                            />
                          )}
                          {values.use_coupon && (
                            <ErrorMessage
                              name="coupon_code"
                              component="div"
                              className="text-red-500 text-sm"
                            />
                          )}
                        </div>

                        {/* Points usage section */}
                        <div className="mt-4">
                          <div className="flex items-center">
                            <label className="inline-flex items-center cursor-pointer">
                              <Field
                                type="checkbox"
                                id="usePoints"
                                name="usePoints"
                                className="sr-only"
                                disabled={availablePoints <= 0}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => handlePointsToggle(e, setFieldValue)}
                              />
                              <div
                                className={`relative w-11 h-6 bg-gray-200 rounded-full peer ${
                                  availablePoints <= 0 ? "opacity-50" : ""
                                }`}
                              >
                                <div
                                  className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-all ${
                                    values.use_points
                                      ? "translate-x-5 border-blue-600"
                                      : ""
                                  }`}
                                ></div>
                              </div>
                              <span className="ml-3 text-sm font-medium text-gray-700">
                                Use Reward Points
                              </span>
                            </label>
                          </div>

                          {values.use_points && availablePoints > 0 && (
                            <div className="mt-2 text-sm text-green-600">
                              Using{" "}
                              {formatNumberWithCommas(values.points_to_use)}{" "}
                              points for a discount of{" "}
                              {formatNumberWithCommas(values.points_to_use)}
                            </div>
                          )}

                          {availablePoints <= 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              You don't have any reward points available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment method */}
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-lg font-semibold mb-2">
                        Payment Method
                      </h3>

                      <div className="space-y-2">
                        <label className="flex items-center">
                          <Field
                            type="radio"
                            name="payment_method"
                            value="creditCard"
                            className="mr-2"
                          />
                          <span>Credit Card</span>
                        </label>

                        <label className="flex items-center">
                          <Field
                            type="radio"
                            name="payment_method"
                            value="bankTransfer"
                            className="mr-2"
                          />
                          <span>Bank Transfer</span>
                        </label>

                        <label className="flex items-center">
                          <Field
                            type="radio"
                            name="payment_method"
                            value="eWallet"
                            className="mr-2"
                          />
                          <span>E-Wallet</span>
                        </label>
                      </div>
                      <ErrorMessage
                        name="payment_method"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* Order summary */}
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-lg font-semibold mb-2">
                        Order Summary
                      </h3>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal ({values.quantity} tickets)</span>
                          <span>
                            {formatNumberWithCommas(
                              event.price * values.quantity
                            )}
                          </span>
                        </div>

                        {values.use_voucher && voucherDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Voucher Discount</span>
                            <span>
                              -{formatNumberWithCommas(voucherDiscount)}
                            </span>
                          </div>
                        )}

                        {values.use_coupon && couponDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Coupon Discount</span>
                            <span>
                              -{formatNumberWithCommas(couponDiscount)}
                            </span>
                          </div>
                        )}

                        {values.use_points && values.points_to_use > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Points Used</span>
                            <span>
                              -{formatNumberWithCommas(values.points_to_use)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total</span>
                          <span>
                            {formatNumberWithCommas(calculateTotal(values))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Submit button */}
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={
                          isSubmitting ||
                          !isValid ||
                          hasUnappliedDiscountCode(values)
                        }
                        className="w-full py-3 bg-[#222432] text-white font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting
                          ? "Processing..."
                          : hasUnappliedDiscountCode(values)
                          ? "Please apply your discount code first"
                          : "Complete Purchase"}
                      </button>
                    </div>

                    {/* Add a warning message when there's an unapplied code */}
                    {hasUnappliedDiscountCode(values) && (
                      <div className="mt-2 text-sm text-orange-500 text-center">
                        You have entered a discount code but haven't applied it
                        yet. Please click the "Apply" button to use your
                        discount.
                      </div>
                    )}
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
