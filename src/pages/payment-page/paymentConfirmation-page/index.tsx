"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/components/config/api";
import { cloudinaryBaseUrl } from "@/components/config/cloudinary";
import { IAcceptedTransaction, IEventDetails } from "./components/types";
import { formatNumberWithCommas, formatDate } from "@/utils/formatters";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import {
  updateTransactionStatus,
  setCurrentTransaction,
} from "@/lib/redux/features/transactionSlice";
import { differenceInSeconds, addHours, addDays, format } from "date-fns";

export default function PaymentConfirmationPage({
  transactionId,
}: {
  transactionId: string;
}) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<IAcceptedTransaction | null>(
    null
  );
  const [event, setEvent] = useState<IEventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    IAcceptedTransaction["status"] | "pending"
  >("pending");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const { currentTransaction, subtotal, discounts, calculatedTotal } =
    useAppSelector((state) => state.transaction);
  const [paymentDeadline, setPaymentDeadline] = useState<Date | null>(null);
  const [adminDeadline, setAdminDeadline] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Add state to track if polling should be active
  const [isPolling, setIsPolling] = useState(false);

  // Add this helper function
  const formatDeadline = (date: Date | null) => {
    if (!date) return "";
    return format(date, "MMM dd, yyyy 'at' h:mm a");
  };

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        // If we already have the transaction in Redux, use it
        if (currentTransaction && currentTransaction.id === transactionId) {
          setTransaction(currentTransaction);
          setPaymentStatus(currentTransaction.status);

          // Still fetch the event details
          const token = localStorage.getItem("token");
          const eventResponse = await axios.get(
            `${API_BASE_URL}/events/${currentTransaction.event_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          setEvent(eventResponse.data.data);
          setLoading(false);
          return;
        }

        // Otherwise fetch from API as before
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        console.log(`Fetching transaction with ID: ${transactionId}`);

        // Add error handling for invalid transaction ID
        if (!transactionId || typeof transactionId !== "string") {
          console.error("Invalid transaction ID:", transactionId);
          setError("Invalid transaction ID");
          setLoading(false);
          return;
        }

        // Check the API endpoint format - make sure it matches what the backend expects
        const response = await axios.get(
          `${API_BASE_URL}/transactions/${transactionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              // Add Content-Type header
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Transaction response:", response.data);

        // Make sure we're getting the correct data structure
        if (response.data && response.data.data) {
          const transactionData = response.data.data as IAcceptedTransaction;
          setTransaction(transactionData);

          // Set payment status directly from the transaction status
          setPaymentStatus(transactionData.status);

          // Update Redux with transaction data if it's not already there
          if (
            !currentTransaction ||
            currentTransaction.id !== transactionData.id
          ) {
            dispatch(setCurrentTransaction(transactionData));
          }

          console.log("Transaction status:", transactionData.status);
          console.log("Transaction total price:", transactionData.total_price);
        }

        // Fetch event details
        const eventResponse = await axios.get(
          `${API_BASE_URL}/events/${response.data.data.event_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setEvent(eventResponse.data.data);
      } catch (err) {
        console.error("Error fetching transaction:", err);

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

        setError("Failed to load transaction details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId, currentTransaction, router]);

  useEffect(() => {
    if (transaction) {
      // For waiting_for_payment status, set 2-hour deadline from transaction creation
      if (transaction.status === "waiting_for_payment") {
        const createdAt = new Date(transaction.created_at);
        const deadline = addHours(createdAt, 2);
        setPaymentDeadline(deadline);
      }

      // For waiting_for_admin_confirmation status, set 3-day deadline from last update
      if (transaction.status === "waiting_for_admin_confirmation") {
        const updatedAt = new Date(transaction.updated_at);
        const deadline = addDays(updatedAt, 3);
        setAdminDeadline(deadline);
      }
    }
  }, [transaction]);

  useEffect(() => {
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
        const hours = Math.floor(
          (secondsRemaining % (24 * 60 * 60)) / (60 * 60)
        );
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
      // Require payment proof for ALL payment methods
      if (!paymentProof) {
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

  // Add polling mechanism after payment proof submission
  useEffect(() => {
    // Only start polling if we're waiting for admin confirmation
    // or if polling is explicitly enabled
    if (paymentStatus === "waiting_for_admin_confirmation" || isPolling) {
      console.log("Starting status polling after payment submission...");

      // Poll every 20 seconds
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

            // Update transaction data and status if changed
            if (
              JSON.stringify(transaction) !== JSON.stringify(updatedTransaction)
            ) {
              setTransaction(updatedTransaction);
            }

            // If status changed, update UI
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

              // Stop polling if we reach a final state
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
  }, [paymentStatus, transactionId, transaction, isPolling, dispatch, router]);

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error)
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!transaction || !event)
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
                  src={`${cloudinaryBaseUrl}${event.event_image}`}
                  alt={event.name}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div>
                  <h3 className="font-semibold">{event.name}</h3>
                  <p className="text-gray-600">{event.location}</p>
                  <p className="text-gray-600">
                    Attend date: {formatDate(transaction.attend_date)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flex justify-between mb-2">
                  <span>Subtotal ({transaction.quantity} tickets)</span>
                  <span>
                    {formatNumberWithCommas(
                      subtotal || event.price * transaction.quantity
                    )}
                  </span>
                </div>

                {transaction.voucher_code && (
                  <div className="flex justify-between text-green-600 mb-2">
                    <span>Voucher Discount</span>
                    <span>
                      -
                      {formatNumberWithCommas(
                        discounts.voucherDiscount ||
                          transaction.voucher_discount ||
                          0
                      )}
                    </span>
                  </div>
                )}

                {transaction.coupon_code && (
                  <div className="flex justify-between text-green-600 mb-2">
                    <span>Coupon Discount</span>
                    <span>
                      -
                      {formatNumberWithCommas(
                        discounts.couponDiscount ||
                          transaction.coupon_discount ||
                          0
                      )}
                    </span>
                  </div>
                )}

                {transaction.points_used > 0 && (
                  <div className="flex justify-between text-green-600 mb-2">
                    <span>Points Used</span>
                    <span>
                      -
                      {formatNumberWithCommas(
                        discounts.pointsUsed || transaction.points_used || 0
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span>
                    {formatNumberWithCommas(
                      // First try Redux calculated total
                      calculatedTotal ||
                        // Then try transaction total from API
                        (transaction && transaction.total_price) ||
                        // Finally calculate from event price and quantity as fallback
                        (event && transaction
                          ? event.price * transaction.quantity
                          : 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

          <div className="mb-4">
            <p className="font-medium">Payment Method:</p>
            <p className="capitalize">{transaction?.payment_method}</p>
          </div>

          <div className="mb-4">
            <p className="font-medium">Status:</p>
            <p
              className={`capitalize ${
                paymentStatus === "confirmed"
                  ? "text-green-600"
                  : paymentStatus === "rejected" ||
                    paymentStatus === "expired" ||
                    paymentStatus === "canceled"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {paymentStatus === "waiting_for_payment"
                ? "Waiting for Payment"
                : paymentStatus === "waiting_for_admin_confirmation"
                ? "Waiting for Admin Confirmation"
                : paymentStatus}
            </p>
          </div>

          {/* Add payment proof upload for bank transfer and e-wallet */}
          <div className="mb-4">
            <p className="font-medium mb-2">Upload Payment Proof:</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            {paymentProof && (
              <p className="text-green-600 text-sm">
                File selected: {paymentProof.name}
              </p>
            )}
          </div>

          {/* Payment button logic based on status */}
          {paymentStatus === "waiting_for_payment" && (
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

          {paymentStatus === "waiting_for_admin_confirmation" && (
            <div className="text-yellow-600 text-center p-3 bg-yellow-50 rounded-md">
              <p className="mb-2">
                Your payment proof has been submitted and is awaiting admin
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

          {paymentStatus === "confirmed" && (
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

          {paymentStatus === "rejected" && (
            <div className="text-red-600 text-center p-3 bg-red-50 rounded-md mb-3">
              Your payment has been rejected. Please try again with a valid
              payment proof.
            </div>
          )}

          {paymentStatus === "expired" && (
            <div className="text-red-600 text-center p-3 bg-red-50 rounded-md mb-3">
              This transaction has expired. Please create a new booking.
            </div>
          )}

          {paymentStatus === "canceled" && (
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
