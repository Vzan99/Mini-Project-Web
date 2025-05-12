"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { API_BASE_URL } from "@/components/config/api";
import { formatDate, formatNumberWithCommas } from "@/utils/formatters";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { cloudinaryBaseUrl } from "@/components/config/cloudinary";
import ReactDOM from "react-dom/client";
import TicketDownloadTemplate from "@/components/TicketDownloadTemplate";
import { ITicket, ITransaction } from "./components/types";

export default function TicketDetailsPage({
  transactionId,
}: {
  transactionId: string;
}) {
  const router = useRouter();
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [transaction, setTransaction] = useState<ITransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) {
      return "https://via.placeholder.com/400x200";
    }
    return imagePath.startsWith("http")
      ? imagePath
      : `${cloudinaryBaseUrl}${imagePath}`;
  };

  useEffect(() => {
    const fetchTicketsAndTransaction = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch transaction details
        const transactionResponse = await axios.get(
          `${API_BASE_URL}/transactions/${transactionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTransaction(transactionResponse.data.data);

        // Fetch tickets
        const ticketsResponse = await axios.get(
          `${API_BASE_URL}/transactions/tickets`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Filter tickets for this transaction
        const transactionTickets = ticketsResponse.data.data.filter(
          (ticket: ITicket) => ticket.transaction_id === transactionId
        );
        setTickets(transactionTickets);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load ticket details");
      } finally {
        setLoading(false);
      }
    };

    fetchTicketsAndTransaction();
  }, [transactionId, router]);

  const downloadTicket = async (ticket: ITicket) => {
    try {
      // Check if transaction exists
      if (!transaction) {
        alert("Transaction data is missing. Cannot download ticket.");
        return;
      }

      // Create a hidden iframe to isolate the rendering environment
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.style.width = "850px"; // Slightly larger than our template
      iframe.style.height = "400px"; // Enough height for the template
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      // Wait for iframe to load
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        iframe.src = "about:blank";
      });

      // Get iframe document and create a container
      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc) {
        throw new Error("Could not access iframe document");
      }

      // Create a container in the iframe
      const container = iframeDoc.createElement("div");
      iframeDoc.body.appendChild(container);

      // Create a root in the iframe's container
      const root = ReactDOM.createRoot(container);

      // Render the ticket template in the iframe
      root.render(
        <TicketDownloadTemplate
          ticketCode={ticket.ticket_code}
          eventName={ticket.event?.name || "Event"}
          eventDate={formatDate(transaction.attend_date)}
          eventLocation={ticket.event?.location || "Location"}
          eventImageUrl={getImageUrl(ticket.event?.event_image)}
        />
      );

      // Wait for rendering and images to load
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Use html2canvas on the container in the iframe
      const canvas = await html2canvas(container.firstChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "white",
        logging: false,
      });

      // Clean up
      document.body.removeChild(iframe);

      // Convert and download
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `ticket-${ticket.id}.png`);
        }
      });
    } catch (err) {
      console.error("Error downloading ticket:", err);
      alert("Failed to download ticket. Please try again.");
    }
  };

  const downloadAllTickets = async () => {
    try {
      for (const ticket of tickets) {
        await downloadTicket(ticket);
      }
    } catch (err) {
      console.error("Error downloading all tickets:", err);
      alert("Failed to download all tickets. Please try again.");
    }
  };

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error)
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!transaction || tickets.length === 0)
    return (
      <div className="container mx-auto p-4">
        No tickets found for this transaction
      </div>
    );

  return (
    <div className="bg-[#FAF0D7] min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Tickets</h1>
            <button
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Home
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {transaction.event?.name}
            </h2>
            <p className="text-gray-600">
              Date: {formatDate(transaction.attend_date)}
            </p>
            <p className="text-gray-600">
              Location: {transaction.event?.location}
            </p>
            <p className="text-gray-600">Quantity: {transaction.quantity}</p>
            <button
              onClick={downloadAllTickets}
              className="mt-4 bg-[#222432] text-white py-2 px-4 rounded-md hover:bg-opacity-90"
            >
              Download All Tickets
            </button>
          </div>

          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                id={`ticket-${ticket.id}`}
                className="border border-gray-200 rounded-lg p-4 bg-white"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left side - Event image (square) */}
                  <div className="md:w-1/4 flex flex-col items-center justify-center">
                    <div className="bg-white p-2 rounded-md mb-2 w-[120px] h-[120px] overflow-hidden">
                      <div className="relative w-full h-full">
                        <Image
                          src={getImageUrl(ticket.event?.event_image)}
                          alt={ticket.event?.name || "Event"}
                          fill
                          sizes="(max-width: 768px) 100vw, 120px"
                          style={{ objectFit: "cover" }}
                          className="rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/400x400";
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Middle - Ticket details */}
                  <div className="md:w-2/4 flex flex-col justify-between my-auto">
                    <div>
                      <h3 className="font-bold text-lg">
                        {ticket.event?.name}
                      </h3>
                      <p className="text-gray-600">
                        Date: {formatDate(transaction.attend_date)}
                      </p>
                      <p className="text-gray-600">
                        Location: {ticket.event?.location}
                      </p>
                      <p className="text-gray-600">
                        Ticket Code: {ticket.ticket_code}
                      </p>
                    </div>
                  </div>

                  {/* Right side - QR code */}
                  <div className="md:w-1/4 flex flex-col items-center justify-center">
                    <div className="bg-white p-2 rounded-md mb-2 w-[120px] h-[120px]">
                      <QRCode value={ticket.ticket_code} size={112} level="H" />
                    </div>
                    <button
                      onClick={() => downloadTicket(ticket)}
                      className="text-sm bg-[#222432] text-white py-1 px-3 rounded-md hover:bg-opacity-90"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
