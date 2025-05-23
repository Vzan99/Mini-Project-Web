"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BuyTicketButtonProps = {
  eventId: string;
  eventName: string;
  quantity?: number;
  isDisabled?: boolean;
  disabledReason?: string;
};

export default function BuyTicketButton({
  eventId,
  eventName,
  quantity = 1,
  isDisabled = false,
  disabledReason = "",
}: BuyTicketButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleBuyTicket = async () => {
    if (isDisabled) return;

    setIsLoading(true);
    try {
      if (
        !eventId ||
        !eventId.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        )
      ) {
        alert("Invalid event ID. Please try again or contact support.");
        return;
      }

      router.push(`/transaction?eventId=${eventId}`);
    } catch (error) {
      console.error("Error processing ticket purchase:", error);
      alert(
        "Sorry, there was an error processing your request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuyTicket}
      disabled={isLoading || isDisabled}
      className={`w-full py-3 px-6 rounded-lg font-semibold transition 
        ${isDisabled ? "bg-gray-400 cursor-not-allowed" : "buttonC"}
      `}
    >
      {isDisabled ? (
        disabledReason
      ) : isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </span>
      ) : (
        `Buy ${quantity > 1 ? quantity + " Tickets" : "Ticket"}`
      )}
    </button>
  );
}
