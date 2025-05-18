"use client";
import React, { useRef, useEffect } from "react";
import { IEventSuggestion } from "@/components/discover/types";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  suggestions: IEventSuggestion[];
  showSuggestions: boolean;
  setShowSuggestions: (value: boolean) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSuggestionClick: (suggestion: IEventSuggestion) => void;
  fetchEvents: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  handleSearchChange,
  handleSuggestionClick,
  fetchEvents,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const input = searchInputRef.current;
      const dropdown = document.querySelector(".suggestions-dropdown");

      if (
        input &&
        dropdown &&
        !input.contains(target) &&
        !dropdown.contains(target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowSuggestions]);

  return (
    <div className="mb-8 max-w-xl mx-auto relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          ref={searchInputRef}
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search events..."
          className="w-full pl-12 pr-35 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-black bg-white text-base md:text-xl lg:text-xl"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setShowSuggestions(false);
              if (searchInputRef.current) searchInputRef.current.focus();
            }}
            className="absolute right-[100px] top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 rounded-full p-1"
            aria-label="Clear search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        <button
          onClick={fetchEvents}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#222432] text-white px-4 py-1 rounded-full hover:scale-110 transition-transform"
        >
          Search
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto suggestions-dropdown">
          <ul>
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              >
                <div className="flex items-center">
                  {suggestion.event_image && (
                    <img
                      src={`https://res.cloudinary.com/dnb5cxo2m/image/upload/${suggestion.event_image}`}
                      alt={suggestion.name}
                      className="w-10 h-10 object-cover rounded mr-3"
                    />
                  )}
                  <div className="text-left w-full">
                    <div className="font-medium">{suggestion.name}</div>
                    <div className="text-sm text-gray-500">
                      {suggestion.location}
                    </div>
                  </div>
                </div>
              </li>
            ))}
            <li
              className="p-3 text-center text-blue-600 hover:bg-gray-100 cursor-pointer font-medium"
              onClick={fetchEvents}
            >
              See all results for "{searchQuery}"
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
