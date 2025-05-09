"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/components/config/api";
import { ITransaction } from "@/interfaces/transaction";
import { IEventDetails } from "@/interfaces/eventDetails";
import { formatDate } from "@/utils/formatters";

export default function PaymentSuccessPage({ 
  transactionId 
}: { 
  transactionId: string 
}) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<ITransaction | null>(null);
  const [event, setEvent] = useState<IEventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/transactions/${transactionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTransaction(response.data.data);
        
        // Fetch event details
        const eventResponse = await axios.get(
          `${API_BASE_URL}/events/${response.data.data.eventId}`
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
  }, [transactionId, router]);

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!transaction || !event) return <div className="container mx-auto p-4">Transaction not found</div>;

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
            <p>Date: {formatDate(transaction.attendDate)}</p>
            <p>Location: {event.location}</p>
            <p>Tickets: {transaction.quantity}</p>
            <p>Transaction ID: {transaction.id}</p>
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