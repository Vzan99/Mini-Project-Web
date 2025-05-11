"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/components/config/api";
import { cloudinaryBaseUrl } from "@/components/config/cloudinary";
import { IAcceptedTransaction, IEventDetails } from "./components/types";
import { formatNumberWithCommas, formatDate } from "@/utils/formatters";

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
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
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
        setTransaction(response.data.data);

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
  }, [transactionId, router]);

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
      setPaymentStatus("processing");

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
      await axios.post(
        `${API_BASE_URL}/transactions/${transactionId}/payment`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setPaymentStatus("completed");

      // Redirect to success page after 1 second
      setTimeout(() => {
        router.push(`/payment/success/${transactionId}`);
      }, 1000);
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentStatus("failed");
      setError("Payment processing failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

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
                  <span>Tickets</span>
                  <span>
                    {transaction.quantity} ×{" "}
                    {formatNumberWithCommas(event.price)}
                  </span>
                </div>

                {transaction.voucher_code && (
                  <div className="flex justify-between text-green-600 mb-2">
                    <span>Voucher</span>
                    <span>
                      -
                      {formatNumberWithCommas(
                        transaction.total_price -
                          event.price * transaction.quantity
                      )}
                    </span>
                  </div>
                )}

                {transaction.coupon_code && (
                  <div className="flex justify-between text-green-600 mb-2">
                    <span>Coupon</span>
                    <span>
                      -
                      {formatNumberWithCommas(
                        transaction.total_price -
                          event.price * transaction.quantity
                      )}
                    </span>
                  </div>
                )}

                {transaction.points_used > 0 && (
                  <div className="flex justify-between text-green-600 mb-2">
                    <span>Points</span>
                    <span>
                      -{formatNumberWithCommas(transaction.points_used)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatNumberWithCommas(transaction.total_price)}</span>
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
                paymentStatus === "completed"
                  ? "text-green-600"
                  : paymentStatus === "failed"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {paymentStatus}
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

          {paymentStatus === "pending" && (
            <button
              onClick={handleCompletePayment}
              disabled={uploading}
              className="w-full py-3 bg-[#222432] text-white rounded-md font-medium"
            >
              {uploading ? "Uploading..." : "Complete Payment"}
            </button>
          )}

          {paymentStatus === "processing" && (
            <button
              disabled
              className="w-full py-3 bg-gray-400 text-white rounded-md font-medium"
            >
              Processing...
            </button>
          )}

          {paymentStatus === "failed" && (
            <button
              onClick={handleCompletePayment}
              className="w-full py-3 bg-red-600 text-white rounded-md font-medium"
            >
              Retry Payment
            </button>
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
