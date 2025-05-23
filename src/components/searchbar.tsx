"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/components/config/api";
import { cloudinaryBaseUrl } from "./config/cloudinary";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let didCancel = false;

    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/events/search?query=${encodeURIComponent(
            debouncedQuery
          )}&limit=5`
        );

        if (!response.ok) throw new Error("Failed to fetch suggestions");

        const data = await response.json();
        if (!didCancel) setSuggestions(data.data || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        if (!didCancel) setSuggestions([]);
      } finally {
        if (!didCancel) setLoading(false);
      }
    };

    if (debouncedQuery && !didCancel) {
      fetchSuggestions();
    }

    return () => {
      didCancel = true;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const finalQuery = query.trim();
    if (finalQuery) {
      setShowSuggestions(false);
      setSuggestions([]);
      setQuery("");
      setDebouncedQuery("");
      router.push(`/discover?query=${encodeURIComponent(finalQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setShowSuggestions(false);
    setQuery("");
    setDebouncedQuery("");
    router.push(`/events/${suggestion.id}`);
  };

  return (
    <div className="relative w-full" ref={suggestionRef}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row items-center w-full gap-3 md:gap-4 lg:gap-6"
      >
        <div className="relative w-full md:flex-grow">
          <div className="absolute inset-y-0 left-3 md:left-4 flex items-center pointer-events-none">
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
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search events..."
            className="p-2 text-black rounded-4xl text-base md:text-xl lg:text-xl focus:outline-none focus:ring-2 focus:ring-black w-full border bg-white pl-10 md:pl-12 pr-5 md:pr-10 py-2"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-3 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 hover:text-gray-600"
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

          {/* Suggestions dropdown */}
          {showSuggestions && query.length >= 2 && (
            <div className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-center text-gray-500">Loading...</div>
              ) : suggestions.length > 0 ? (
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
                            src={`${cloudinaryBaseUrl}${suggestion.event_image}`}
                            alt={suggestion.name}
                            className="w-10 h-10 object-cover rounded mr-3"
                          />
                        )}
                        <div className="text-left w-full">
                          <div className="font-medium">{suggestion.name}</div>
                          <div className="text-sm text-gray-500 text-left">
                            {suggestion.location}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                  <li
                    className="p-3 text-center text-black hover:bg-gray-100 cursor-pointer font-medium"
                    onClick={() => handleSubmit()}
                  >
                    See all results for "{query}"
                  </li>
                </ul>
              ) : (
                <div className="p-3 text-center text-gray-500">
                  No suggestions found
                </div>
              )}
            </div>
          )}
        </div>
        <button type="submit" className="buttonB w-full md:w-auto mt-2 md:mt-0">
          Search
        </button>
      </form>
    </div>
  );
}
