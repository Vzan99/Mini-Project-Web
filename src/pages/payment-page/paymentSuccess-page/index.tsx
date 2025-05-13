"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/components/config/api";
import { ReduxTransaction } from "@/lib/redux/features/transactionSlice";
import { IEventDetails, ITicket } from "./components/types";
import { formatDate, formatNumberWithCommas } from "@/utils/formatters";
import { useAppSelector } from "@/lib/redux/hooks";
import LoadingSpinnerScreen from "@/components/loadings/loadingSpinnerScreen";

export default function PaymentSuccessPage({
  transactionId,
}: {
  transactionId: string;
}) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<ReduxTransaction | null>(null);
  const [event, setEvent] = useState<IEventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const { currentTransaction, subtotal, discounts, calculatedTotal } =
    useAppSelector((state) => state.transaction);

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        // If we already have the transaction in Redux, use it
        if (currentTransaction && currentTransaction.id === transactionId) {
          setTransaction(currentTransaction);

          // Check if event property exists in currentTransaction
          if (currentTransaction.event) {
            setEvent(currentTransaction.event);
          } else {
            // Fetch event details if not included in the transaction
            const eventResponse = await axios.get(
              `${API_BASE_URL}/events/${currentTransaction.event_id}`
            );
            setEvent(eventResponse.data.data);
          }

          setLoading(false);
          return;
        }

        // Otherwise fetch from API
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/transactions/${transactionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTransaction(response.data.data);

        // Fetch event details
        const eventResponse = await axios.get(
          `${API_BASE_URL}/events/${response.data.data.event_id}`
        );
        setEvent(eventResponse.data.data);
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError("Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transactionId, router, currentTransaction]);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!transaction || transaction.status !== "confirmed") return;

      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Update to the correct endpoint
        const response = await axios.get(
          `${API_BASE_URL}/transactions/tickets`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Filter tickets for this transaction if needed
        const transactionTickets = response.data.data.filter(
          (ticket: ITicket) => ticket.transaction_id === transactionId
        );

        setTickets(transactionTickets);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      }
    };

    fetchTickets();
  }, [transaction, transactionId]);

  if (loading) return LoadingSpinnerScreen();
  if (error)
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!transaction || !event)
    return <div className="container mx-auto p-4">Transaction not found</div>;

  return (
    <div className="bg-[#FAF0D7] min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your tickets for {event.name} have been confirmed.
          </p>

          <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
            <h2 className="font-semibold mb-2">Ticket Details:</h2>
            <p>Event: {event.name}</p>
            <p>Date: {formatDate(transaction.attend_date)}</p>
            <p>Location: {event.location}</p>
            <p>Tickets: {transaction.quantity}</p>
            <p>Transaction ID: {transaction.id}</p>

            {/* Add price details */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="font-semibold">Price Details:</p>
              <p>
                Subtotal:{" "}
                {formatNumberWithCommas(
                  subtotal || event.price * transaction.quantity
                )}
              </p>

              {transaction.voucher_code && (
                <p className="text-green-600">
                  Voucher Discount: -
                  {formatNumberWithCommas(
                    discounts.voucherDiscount ||
                      transaction.voucher_discount ||
                      0
                  )}
                </p>
              )}

              {transaction.coupon_code && (
                <p className="text-green-600">
                  Coupon Discount: -
                  {formatNumberWithCommas(
                    discounts.couponDiscount || transaction.coupon_discount || 0
                  )}
                </p>
              )}

              {transaction.points_used > 0 && (
                <p className="text-green-600">
                  Points Used: -
                  {formatNumberWithCommas(
                    discounts.pointsUsed || transaction.points_used || 0
                  )}
                </p>
              )}

              <p className="font-bold mt-2 pt-2 border-t">
                Total:{" "}
                {formatNumberWithCommas(
                  calculatedTotal || transaction.total_price
                )}
              </p>
            </div>

            {/* After the existing ticket details section */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h2 className="font-semibold mb-2">Your Tickets:</h2>
              {tickets.length > 0 ? (
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white p-2 border rounded-md"
                    >
                      <p className="font-medium">
                        Ticket Code: {ticket.ticket_code}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Your tickets are being processed. You can view them later in
                  "My Tickets".
                </p>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            A confirmation email has been sent to your registered email address.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/tickets/${transaction.id}`)}
              className="w-full py-3 bg-[#222432] text-white rounded-md font-medium"
            >
              View My Tickets
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full py-3 border border-gray-300 rounded-md font-medium"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
