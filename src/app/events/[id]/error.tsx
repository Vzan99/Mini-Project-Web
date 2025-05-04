"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error in events/[id] page:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="mb-6 text-gray-600">{error.message}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
          >
            Try again
          </button>
          <Link
            href="/events"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded"
          >
            Back to events
          </Link>
        </div>
      </div>
    </div>
  );
}
