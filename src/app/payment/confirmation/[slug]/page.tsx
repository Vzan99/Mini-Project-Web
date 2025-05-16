"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/components/config/api";
import { cloudinaryBaseUrl } from "@/components/config/cloudinary";
import {
  IAcceptedTransaction,
  IEventDetails,
} from "@/components/payment/paymentConfirmation/types";
import { formatNumberWithCommas, formatDate } from "@/utils/formatters";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  updateTransactionStatus,
  setCurrentTransaction,
} from "@/lib/redux/features/transactionSlice";
import { differenceInSeconds, addHours, addDays, format } from "date-fns";
import LoadingSpinnerScreen from "@/components/loadings/loadingSpinnerScreen";

export default function PaymentConfirmationPage() {
  const router = useRouter();

  const [event, setEvent] = useState<IEventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const { currentTransaction, subtotal, discounts, calculatedTotal } =
    useAppSelector((state) => state.transaction);
  const [paymentStatus, setPaymentStatus] = useState<
    IAcceptedTransaction["status"]
  >(currentTransaction?.status || "waiting_for_payment");

  const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
  const [adminDeadline, setAdminDeadline] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const [isPolling, setIsPolling] = useState(false);

  const transactionId = currentTransaction?.id;

  const formatDeadline = (date: Date | null) => {
    if (!date) return "";
    return format(date, "MMM dd, yyyy 'at' h:mm a");
  };

  const calledGenerateFreeTickets = useRef(false);

  async function fetchTransactionDetails() {
    try {
      if (!transactionId) {
        setError("Missing transaction ID");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch transaction
      const response = await axios.get(
        `${API_BASE_URL}/transactions/${transactionId}`,
        { headers }
      );
      const transactionData = response.data.data as IAcceptedTransaction;

      if (
        transactionData.status === "confirmed" &&
        transactionData.total_pay_amount === 0 &&
        transactionData.tickets.length === 0 &&
        !calledGenerateFreeTickets.current // <-- only call once
      ) {
        console.log(
          "Free confirmed transaction without tickets, calling generate-free-tickets endpoint..."
        );

        calledGenerateFreeTickets.current = true; // mark as called

        await axios.post(
          `${API_BASE_URL}/transactions/${transactionData.id}/generate-free-tickets`,
          undefined,
          { headers }
        );

        // Re-fetch transaction again to get updated tickets
        const updatedResponse = await axios.get(
          `${API_BASE_URL}/transactions/${transactionData.id}`,
          { headers }
        );
        const updatedTransaction = updatedResponse.data
          .data as IAcceptedTransaction;
        dispatch(setCurrentTransaction(updatedTransaction));
        setPaymentStatus(updatedTransaction.status);
      } else {
        setPaymentStatus(transactionData.status);
        dispatch(setCurrentTransaction(transactionData));
      }

      // Fetch event info
      const eventResponse = await axios.get(
        `${API_BASE_URL}/events/${transactionData.event_id}`,
        { headers }
      );
      setEvent(eventResponse.data.data);
    } catch (err) {
      console.error("Error fetching transaction:", err);
      setError("Failed to load transaction details. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactionDetails();
  }, [transactionId]);

  // Replace local transaction with Redux currentTransaction
  useEffect(() => {
    if (currentTransaction) {
      // For waiting_for_payment status, set 2-hour deadline from transaction creation
      if (currentTransaction.status === "waiting_for_payment") {
        const createdAt = new Date(currentTransaction.created_at);
        const deadline = addHours(createdAt, 2);
        setPaymentDeadline(deadline);
      }

      // For waiting_for_admin_confirmation status, set 3-day deadline from last update
      if (currentTransaction.status === "waiting_for_admin_confirmation") {
        const updatedAt = new Date(currentTransaction.updated_at);
        const deadline = addDays(updatedAt, 3);
        setAdminDeadline(deadline);
      }
    }
  }, [currentTransaction]);

  const updateCountdown = () => {
    const now = new Date();
    let deadline: Date | null = null;

    // Determine which deadline to use based on status
    if (paymentStatus === "waiting_for_payment" && paymentDeadline) {
      deadline = paymentDeadline;
    } else if (
      paymentStatus === "waiting_for_admin_confirmation" &&
      adminDeadline
    ) {
      deadline = adminDeadline;
    }

    if (deadline) {
      const secondsRemaining = differenceInSeconds(deadline, now);

      if (secondsRemaining <= 0) {
        setTimeRemaining("Expired");
        return;
      }

      // Calculate hours, minutes, seconds
      const days = Math.floor(secondsRemaining / (24 * 60 * 60));
      const hours = Math.floor((secondsRemaining % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((secondsRemaining % (60 * 60)) / 60);
      const seconds = Math.floor(secondsRemaining % 60);

      // Format the countdown string based on status
      if (paymentStatus === "waiting_for_payment") {
        setTimeRemaining(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      } else {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }
  };

  useEffect(() => {
    // Update immediately and then every second
    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [paymentStatus, paymentDeadline, adminDeadline]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleCompletePayment = async () => {
    try {
      // Require payment proof for ALL payment methods except for free events
      if (
        ((event && event.price > 0) ||
          (currentTransaction && currentTransaction.total_pay_amount > 0)) &&
        !paymentProof
      ) {
        setError("Please upload payment proof");
        return;
      }

      setUploading(true);
      // Update status in Redux
      dispatch(updateTransactionStatus("processing"));
      setPaymentStatus("processing" as any);

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Create FormData and append payment proof
      const formData = new FormData();
      if (paymentProof) {
        formData.append("payment_proof", paymentProof);
      }

      // Make sure to include the Authorization header with the token
      const response = await axios.post(
        `${API_BASE_URL}/transactions/${transactionId}/payment`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update Redux with new status from response
      if (response.data && response.data.data) {
        dispatch(updateTransactionStatus(response.data.data.status));
        setPaymentStatus(response.data.data.status);

        // Only redirect to success page if admin has confirmed the payment
        if (response.data.data.status === "confirmed") {
          // Redirect to success page after 1 second
          setTimeout(() => {
            router.push(`/payment/success/${transactionId}`);
          }, 1000);
        }
        // Otherwise, stay on this page and show waiting message
      } else {
        // Fallback if response doesn't contain expected data
        setPaymentStatus("waiting_for_admin_confirmation" as any);
        // Do not redirect automatically
      }
    } catch (err) {
      console.error("Payment error:", err);
      dispatch(updateTransactionStatus("failed"));
      setPaymentStatus("failed" as any);
      setError("Payment processing failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Polling effect - replace local transaction updates with Redux updates
  useEffect(() => {
    if (paymentStatus === "waiting_for_admin_confirmation" || isPolling) {
      console.log("Starting status polling after payment submission...");

      const intervalId = setInterval(async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;

          console.log(`Polling transaction ${transactionId} status...`);
          const response = await axios.get(
            `${API_BASE_URL}/transactions/${transactionId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.data && response.data.data) {
            const newStatus = response.data.data.status;
            const updatedTransaction = response.data.data;

            console.log(
              `Current status: ${paymentStatus}, New status: ${newStatus}`
            );

            // Remove local setTransaction, update Redux instead
            // if (JSON.stringify(transaction) !== JSON.stringify(updatedTransaction)) {
            //   setTransaction(updatedTransaction);
            // }
            dispatch(setCurrentTransaction(updatedTransaction));

            // If status changed, update UI and Redux
            if (newStatus !== paymentStatus) {
              console.log(
                `Status changed from ${paymentStatus} to ${newStatus}`
              );
              setPaymentStatus(newStatus);
              dispatch(updateTransactionStatus(newStatus));

              // Handle confirmed status
              if (newStatus === "confirmed") {
                console.log(
                  "Payment confirmed! Redirecting to success page..."
                );
                router.push(`/payment/success/${transactionId}`);
              }

              // Stop polling if final state
              if (
                ["confirmed", "rejected", "expired", "canceled"].includes(
                  newStatus
                )
              ) {
                setIsPolling(false);
              }
            }
          }
        } catch (err) {
          console.error("Error polling for status:", err);
        }
      }, 20000); // 20 seconds

      return () => {
        console.log("Stopping polling");
        clearInterval(intervalId);
      };
    }
  }, [paymentStatus, transactionId, isPolling]);

  if (loading) return <LoadingSpinnerScreen />;
  if (error)
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!currentTransaction || !event)
    return <div className="container mx-auto p-4">Transaction not found</div>;

  return (
    <div className="bg-[#FAF0D7] min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-[#222432]">
          Payment Confirmation
        </h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={`${cloudinaryBaseUrl}${event?.event_image}`}
                  alt={event?.name || ""}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div>
                  <h3 className="font-semibold">{event?.name}</h3>
                  <p className="text-gray-600">{event?.location}</p>
                  <p className="text-gray-600">
                    Attend date:{" "}
                    {formatDate(currentTransaction?.attend_date || "")}
                  </p>
                </div>
              </div>

              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total ({currentTransaction?.quantity || 0} tickets)</span>
                <span>
                  Rp{" "}
                  {formatNumberWithCommas(
                    calculatedTotal ||
                      currentTransaction?.total_pay_amount ||
                      (event && currentTransaction
                        ? event.price * currentTransaction.quantity
                        : 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

          <div className="mb-4">
            <p className="font-medium">Payment Method:</p>
            <p className="capitalize">{currentTransaction?.payment_method}</p>
          </div>

          <div className="mb-4">
            <p className="font-medium">Status:</p>
            <p
              className={`capitalize ${
                currentTransaction?.status === "confirmed"
                  ? "text-green-600"
                  : ["rejected", "expired", "canceled"].includes(
                      currentTransaction?.status || ""
                    )
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {currentTransaction?.status === "waiting_for_payment"
                ? "Waiting for Payment"
                : currentTransaction?.status ===
                  "waiting_for_admin_confirmation"
                ? "Waiting for Admin Confirmation"
                : currentTransaction?.status}
            </p>
          </div>

          {/* Upload payment proof */}
          <div className="mb-4">
            <p className="font-medium mb-2">Upload Payment Proof:</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              disabled={
                currentTransaction?.status !== "waiting_for_payment" ||
                uploading
              }
              className={`w-full p-2 border border-gray-300 rounded mb-2 ${
                currentTransaction?.status !== "waiting_for_payment" ||
                uploading
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            />
            {paymentProof && (
              <p className="text-green-600 text-sm">
                File selected: {paymentProof.name}
              </p>
            )}
          </div>

          {/* Payment button */}
          {currentTransaction?.status === "waiting_for_payment" && (
            <div className="mb-4">
              <div className="bg-yellow-50 p-3 rounded-md">
                <p className="text-yellow-600 font-medium">
                  Waiting for Payment
                </p>
                <p className="text-sm mt-1">
                  Please complete your payment within:
                </p>
                <div className="text-center mt-2">
                  <span className="text-xl font-bold text-red-600">
                    {timeRemaining}
                  </span>
                </div>
                <p className="text-xs mt-2">
                  Your transaction will expire if payment is not completed
                  within 2 hours of creation.
                </p>
                <p className="text-xs mt-1">
                  Deadline: {formatDeadline(paymentDeadline)}
                </p>
              </div>

              <button
                onClick={handleCompletePayment}
                disabled={uploading || !paymentProof}
                className={`w-full py-3 mt-3 ${
                  !paymentProof ? "bg-gray-400" : "bg-[#222432]"
                } text-white rounded-md font-medium`}
              >
                {uploading ? "Uploading..." : "Complete Payment"}
              </button>
            </div>
          )}

          {currentTransaction?.status === "waiting_for_admin_confirmation" && (
            <div className="text-yellow-600 text-center p-3 bg-yellow-50 rounded-md">
              <p className="mb-2">
                Your payment proof has been submitted and is waiting for admin
                confirmation.
              </p>
              <p className="mb-2">Admin will review your payment within:</p>
              <div className="text-center my-2">
                <span className="text-xl font-bold text-red-600">
                  {timeRemaining}
                </span>
              </div>
              <p className="text-xs mt-2">
                If admin does not respond within 3 days, your transaction will
                be automatically canceled. You can contact customer support for
                assistance.
              </p>
              <p className="text-xs mt-1">
                Deadline: {formatDeadline(adminDeadline)}
              </p>
            </div>
          )}

          {currentTransaction?.status === "confirmed" && (
            <div className="text-green-600 p-3 bg-green-50 rounded-md mb-3">
              <p className="text-center mb-3">
                Your payment has been confirmed. Enjoy the event!
              </p>
              <p className="text-center text-sm mb-4">
                You will be redirected to the ticket page in 10 seconds.
              </p>
              <button
                onClick={() => router.push(`/payment/success/${transactionId}`)}
                className="w-full py-3 bg-[#222432] text-white rounded-md font-medium"
              >
                View My Tickets Now
              </button>
            </div>
          )}

          {currentTransaction?.status === "rejected" && (
            <div className="text-red-600 text-center p-3 bg-red-50 rounded-md mb-3">
              Your payment has been rejected. Please try again with a valid
              payment proof.
            </div>
          )}

          {currentTransaction?.status === "expired" && (
            <div className="text-red-600 text-center p-3 bg-red-50 rounded-md mb-3">
              This transaction has expired. Please create a new booking.
            </div>
          )}

          {currentTransaction?.status === "canceled" && (
            <div className="text-red-600 text-center p-3 bg-red-50 rounded-md mb-3">
              This transaction has been canceled due to no response from admin
              within 3 days.
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="text-[#222432] underline"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
