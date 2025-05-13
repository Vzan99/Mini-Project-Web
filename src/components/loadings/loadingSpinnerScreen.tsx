import React from "react";

export default function LoadingSpinnerScreen() {
  return (
    <div className="h-[75vh] bg-[#FAF0D7] flex justify-center items-center">
      <div className="w-12 h-12 border-4 border-t-transparent border-black rounded-full animate-spin" />
    </div>
  );
}
