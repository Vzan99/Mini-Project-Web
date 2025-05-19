import React from "react";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-12 h-12 border-4 border-t-transparent border-black rounded-full animate-spin" />
    </div>
  );
}
