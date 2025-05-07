"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";
import Link from "next/link";
import { cloudinaryBaseUrl } from "@/app/components/config/cloudinary";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { debounce } from "lodash";

type Event = {
  id: string;
  name: string;
  description: string;
  category: "Concert" | "Festival" | "Comedy" | "Museum" | "Others";
  location: string;
  price: number;
  start_date: string;
  end_date: string;
  event_image?: string | null;
  remaining_seats: number;
};

type EventSuggestion = {
  id: string;
  name: string;
};

const categories = [
  "All Events",
  "Concert",
  "Festival",
  "Comedy",
  "Museum",
  "Others",
];

// Common locations - these would ideally come from your database
const locations = [
  "Jakarta",
  "Bandung",
  "Surabaya",
  "Bali",
  "Yogyakarta",
  "Medan",
  "Makassar",
];

const sortOptions = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

export default function Discover() {
  // Search and suggestions
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<EventSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filters
  const [activeFilter, setActiveFilter] = useState("All Events");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // Debounced price state
  const [debouncedMinPrice, setDebouncedMinPrice] = useState("");
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState("");

  // Events and pagination
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const eventsPerPage = 6;

  // Refs for dropdown menus
  const locationRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8000/events/search?query=${encodeURIComponent(
            query
          )}&limit=5`
        );

        if (response.data && response.data.data) {
          setSuggestions(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }, 500)
  ).current;

  // Debounced price update function
  const debouncedPriceUpdate = useRef(
    debounce((min: string, max: string) => {
      setDebouncedMinPrice(min);
      setDebouncedMaxPrice(max);
    }, 800)
  ).current;

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      setShowSuggestions(true);
      debouncedSearch(query);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: EventSuggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    fetchEvents(suggestion.name);
  };

  // Handle location checkbox change
  const handleLocationChange = (location: string) => {
    // If the location is already selected, clear the selection
    // Otherwise, set only this location as selected
    setSelectedLocations(
      selectedLocations.includes(location) ? [] : [location]
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setShowLocationFilter(false);
      }
      if (
        priceRef.current &&
        !priceRef.current.contains(event.target as Node)
      ) {
        setShowPriceFilter(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDateFilter(false);
      }

      // Add this to hide suggestions when clicking outside
      const target = event.target as Node;
      const searchInput = document.querySelector(
        'input[type="text"][placeholder="Search for events..."]'
      );
      const suggestionsContainer = document.querySelector(
        ".absolute.z-10.w-full.bg-white.mt-1"
      );

      if (
        searchInput &&
        suggestionsContainer &&
        !searchInput.contains(target) &&
        !suggestionsContainer.contains(target)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "minPrice") {
      setMinPrice(value);
    } else if (name === "maxPrice") {
      setMaxPrice(value);
    }
  };

  // Effect to handle price input debouncing
  useEffect(() => {
    debouncedPriceUpdate(minPrice, maxPrice);

    // Cleanup function
    return () => {
      debouncedPriceUpdate.cancel();
    };
  }, [minPrice, maxPrice]);

  // Fetch events based on current filters
  const fetchEvents = async (keyword?: string) => {
    setLoading(true);
    setError("");

    try {
      let url = `http://localhost:8000/events/filter?limit=${eventsPerPage}&page=${currentPage}`;

      // Add keyword search if provided
      if (keyword || searchQuery) {
        url += `&keyword=${encodeURIComponent(keyword || searchQuery)}`;
      }

      // Add category filter if not "All Events"
      if (activeFilter !== "All Events") {
        url += `&category=${activeFilter}`;
      }

      // Add location filter if any locations are selected
      if (selectedLocations.length > 0) {
        // Join multiple locations with comma
        url += `&location=${encodeURIComponent(selectedLocations.join(","))}`;
      }

      // Add date filter if selected
      if (selectedDate) {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        url += `&specificDate=${formattedDate}`;
      }

      // Add price filters - use debounced values
      if (freeOnly) {
        // For free events, set both minPrice and maxPrice to 0
        url += "&minPrice=0&maxPrice=0";
      } else if (debouncedMinPrice || debouncedMaxPrice) {
        if (debouncedMinPrice) {
          url += `&minPrice=${debouncedMinPrice}`;
        }
        if (debouncedMaxPrice) {
          url += `&maxPrice=${debouncedMaxPrice}`;
        }
      }

      // Add sort order
      url += `&sortOrder=${sortOrder}`;

      console.log("Fetching events with URL:", url);

      const res = await axios.get(url);

      if (res.data && res.data.events) {
        setEvents(Array.isArray(res.data.events) ? res.data.events : []);

        // Calculate total pages based on total count from API
        const total =
          res.data.total ||
          (Array.isArray(res.data.events) ? res.data.events.length : 0);
        setTotalEvents(total);
        setTotalPages(Math.ceil(total / eventsPerPage));
      } else {
        setEvents([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(
          `Error: ${err.response.status} - ${
            err.response.data?.message || err.message
          }`
        );
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch events when filters change
  useEffect(() => {
    fetchEvents();
  }, [
    activeFilter,
    selectedLocations,
    selectedDate,
    freeOnly,
    debouncedMinPrice, // Changed from minPrice
    debouncedMaxPrice, // Changed from maxPrice
    sortOrder,
    currentPage,
  ]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        &lt;
      </button>
    );

    // Calculate range of page numbers to show
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded border mx-1 ${
            currentPage === i ? "bg-black text-white" : ""
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        &gt;
      </button>
    );

    return buttons;
  };

  return (
    <div className="w-full px-6 py-10 max-w-screen-xl mx-auto">
      <h1 className="text-4xl font-semibold text-center mb-8">
        Discover Events
      </h1>

      {/* Search Section */}
      <div className="mb-8 max-w-xl mx-auto relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for events..."
            className="w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={() => fetchEvents()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#222432] text-white px-4 py-1 rounded-full transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer"
          >
            Search
          </button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Section */}
      <div className="mb-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveFilter(category);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                activeFilter === category
                  ? "bg-[#222432] text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Additional Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {/* Location Filter */}
          <div className="relative" ref={locationRef}>
            <button
              onClick={() => {
                setShowLocationFilter(!showLocationFilter);
                setShowPriceFilter(false);
                setShowDateFilter(false);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                selectedLocations.length > 0
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Location{" "}
              {selectedLocations.length > 0 && `(${selectedLocations.length})`}
            </button>

            {showLocationFilter && (
              <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4 w-64">
                <div className="mb-3 max-h-60 overflow-y-auto">
                  {locations.map((location) => (
                    <label
                      key={location}
                      className="flex items-center text-sm font-medium text-gray-700 mb-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(location)}
                        onChange={() => handleLocationChange(location)}
                        className="mr-2"
                      />
                      {location}
                    </label>
                  ))}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => setSelectedLocations([])}
                    className="text-sm text-gray-600"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowLocationFilter(false)}
                    className="text-sm bg-black text-white px-3 py-1 rounded"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div className="relative" ref={priceRef}>
            <button
              onClick={() => {
                setShowPriceFilter(!showPriceFilter);
                setShowLocationFilter(false);
                setShowDateFilter(false);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                freeOnly || minPrice || maxPrice
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Price
            </button>

            {showPriceFilter && (
              <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4 w-64">
                <div className="mb-3">
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <input
                      type="checkbox"
                      checked={freeOnly}
                      onChange={(e) => {
                        setFreeOnly(e.target.checked);
                        if (e.target.checked) {
                          setMinPrice("");
                          setMaxPrice("");
                        }
                      }}
                      className="mr-2"
                    />
                    Free events only
                  </label>

                  <div
                    className={`space-y-2 ${
                      freeOnly ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Price (Rp)
                      </label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={handlePriceChange}
                        name="minPrice"
                        className="w-full p-2 border rounded text-sm"
                        placeholder="0"
                        min="0"
                        disabled={freeOnly}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Price (Rp)
                      </label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={handlePriceChange}
                        name="maxPrice"
                        className="w-full p-2 border rounded text-sm"
                        placeholder="1000000"
                        min="0"
                        disabled={freeOnly}
                      />
                    </div>
                  </div>
                </div>

                {/* Sort options */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort by Price
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setFreeOnly(false);
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="text-sm text-gray-600"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowPriceFilter(false)}
                    className="text-sm bg-black text-white px-3 py-1 rounded"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div className="relative" ref={dateRef}>
            <button
              onClick={() => {
                setShowDateFilter(!showDateFilter);
                setShowLocationFilter(false);
                setShowPriceFilter(false);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                selectedDate
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Date
            </button>

            {showDateFilter && (
              <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4">
                <Calendar
                  onChange={(date) => setSelectedDate(date as Date)}
                  value={selectedDate}
                  minDate={new Date()}
                  className="border-0"
                />

                {/* Sort options */}
                <div className="mt-3 mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort by Date
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-sm text-gray-600"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowDateFilter(false)}
                    className="text-sm bg-black text-white px-3 py-1 rounded"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery ||
          activeFilter !== "All Events" ||
          selectedLocations.length > 0 ||
          selectedDate ||
          freeOnly ||
          minPrice ||
          maxPrice) && (
          <div className="flex justify-center mb-4">
            <div className="text-sm text-gray-600">
              Filtering:
              {searchQuery && <span className="ml-1">"{searchQuery}"</span>}
              {activeFilter !== "All Events" && (
                <span className="ml-1">{activeFilter}</span>
              )}
              {selectedLocations.length > 0 && (
                <span className="ml-1">in {selectedLocations.join(", ")}</span>
              )}
              {selectedDate && (
                <span className="ml-1">
                  on {format(selectedDate, "dd MMM yyyy")}
                </span>
              )}
              {freeOnly && <span className="ml-1">Free events only</span>}
              {!freeOnly && minPrice && maxPrice && (
                <span className="ml-1">
                  Price: Rp {minPrice} - Rp {maxPrice}
                </span>
              )}
              {!freeOnly && minPrice && !maxPrice && (
                <span className="ml-1">Price: Min Rp {minPrice}</span>
              )}
              {!freeOnly && !minPrice && maxPrice && (
                <span className="ml-1">Price: Max Rp {maxPrice}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Events Display */}
      {loading && (
        <p className="text-center text-gray-500">Loading events...</p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && events.length === 0 && (
        <p className="text-center text-gray-400">No events found.</p>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <Link href={`/events/${event.id}`}>
              {event.event_image && (
                <img
                  src={`${cloudinaryBaseUrl}${event.event_image}`}
                  alt={event.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/400x200";
                  }}
                />
              )}
              {!event.event_image && (
                <img
                  src="https://via.placeholder.com/400x200"
                  alt="No image available"
                  className="w-full h-48 object-cover"
                />
              )}
            </Link>

            <div className="p-4 flex flex-col gap-2">
              <Link href={`/events/${event.id}`}>
                <h2 className="text-lg font-semibold hover:text-blue-600">
                  {event.name}
                </h2>
              </Link>
              <p className="text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>
              <p className="text-sm text-gray-500">{event.location}</p>
              <p className="text-sm text-gray-500">
                {new Date(event.start_date).toLocaleDateString()} –{" "}
                {new Date(event.end_date).toLocaleDateString()}
              </p>
              <p className="mt-2 text-sm font-bold text-green-700">
                {event.price === 0
                  ? "Free"
                  : `Rp ${event.price.toLocaleString()}`}
              </p>
              {event.remaining_seats <= 10 && event.remaining_seats > 0 && (
                <p className="text-xs text-orange-600">
                  Only {event.remaining_seats} seats left!
                </p>
              )}
              {event.remaining_seats === 0 && (
                <p className="text-xs text-red-600 font-bold">Sold Out</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-1">{renderPaginationButtons()}</div>
        </div>
      )}
    </div>
  );
}
