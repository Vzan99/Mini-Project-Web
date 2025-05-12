"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";
import Link from "next/link";
import { cloudinaryBaseUrl } from "@/components/config/cloudinary";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { debounce } from "lodash";
import { IEventDiscover, IEventSuggestion } from "./components/types";
import { API_BASE_URL } from "@/components/config/api";
import { formatEventDates } from "@/utils/formatters";

const categories = [
  "All Events",
  "Concert",
  "Festival",
  "Comedy",
  "Museum",
  "Others",
];

const sortOptions = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

export default function DiscoverPage() {
  // Search and suggestions
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<IEventSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Add state for locations
  const [locations, setLocations] = useState<string[]>([]);

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

  // Add temporary state to hold filter values before applying
  const [tempSelectedLocations, setTempSelectedLocations] = useState<string[]>(
    []
  );
  const [tempFreeOnly, setTempFreeOnly] = useState(false);
  const [tempMinPrice, setTempMinPrice] = useState("");
  const [tempMaxPrice, setTempMaxPrice] = useState("");
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null);
  const [tempSortOrder, setTempSortOrder] = useState("asc");

  // Initialize temp values when opening filters
  useEffect(() => {
    if (showLocationFilter) {
      setTempSelectedLocations([...selectedLocations]);
    }
  }, [showLocationFilter]);

  useEffect(() => {
    if (showPriceFilter) {
      setTempFreeOnly(freeOnly);
      setTempMinPrice(minPrice);
      setTempMaxPrice(maxPrice);
      setTempSortOrder(sortOrder);
    }
  }, [showPriceFilter]);

  useEffect(() => {
    if (showDateFilter) {
      setTempSelectedDate(selectedDate);
      setTempSortOrder(sortOrder);
    }
  }, [showDateFilter]);

  // Debounced price state
  const [debouncedMinPrice, setDebouncedMinPrice] = useState("");
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState("");

  // Events and pagination
  const [events, setEvents] = useState<IEventDiscover[]>([]);
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

  // Add a ref for the search input
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Function to fetch locations (moved inside the component)
  const fetchLocations = async () => {
    try {
      console.log("Fetching locations...");
      const response = await axios.get(`${API_BASE_URL}/admin/locations`);

      console.log("Locations response:", response.data);
      if (response.data && response.data.data) {
        setLocations(response.data.data);
        console.log("Locations set:", response.data.data);
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
      // Fallback to empty array if fetch fails
      setLocations([]);
    }
  };

  // Call fetchLocations when component mounts (moved inside the component)
  useEffect(() => {
    fetchLocations();
  }, []);

  // Add this useEffect to focus the search input when the component mounts
  useEffect(() => {
    // Focus the search input when the component mounts
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/events/search?query=${encodeURIComponent(
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
  const handleSuggestionClick = (suggestion: IEventSuggestion) => {
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
      let url = `${API_BASE_URL}/events/filter?limit=${eventsPerPage}&page=${currentPage}`;

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
        // Format the date as YYYY-MM-DD
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${day}`;

        url += `&specific_date=${formattedDate}`;

        console.log(`Filtering by date: ${formattedDate}`);
      }

      // Add price filters - use debounced values
      if (freeOnly) {
        // For free events, set both minPrice and maxPrice to 0
        url += "&min_price=0&max_price=0"; // Changed from minPrice/maxPrice to min_price/max_price
      } else if (debouncedMinPrice || debouncedMaxPrice) {
        if (debouncedMinPrice) {
          url += `&min_price=${debouncedMinPrice}`; // Changed from minPrice to min_price
        }
        if (debouncedMaxPrice) {
          url += `&max_price=${debouncedMaxPrice}`; // Changed from maxPrice to max_price
        }
      }

      // Add sort order
      url += `&sort_order=${sortOrder}`; // Changed from sortOrder to sort_order

      console.log("Fetching events with URL:", url);

      const res = await axios.get(url);

      console.log("API Response:", res.data);

      if (res.data && res.data.events) {
        // Update to use the new response structure
        setEvents(
          Array.isArray(res.data.events.events) ? res.data.events.events : []
        );

        // Use the pagination information from the API
        if (res.data.events.pagination) {
          setTotalEvents(res.data.events.pagination.total);
          setTotalPages(res.data.events.pagination.totalPages);
          // Make sure currentPage matches what the server returned
          setCurrentPage(res.data.events.pagination.currentPage);
        } else {
          // Fallback if pagination info is not provided
          setTotalEvents(res.data.events.events.length);
          setTotalPages(1);
        }
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
        className="px-3 py-1 rounded border disabled:opacity-50 cursor-pointer"
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
          className={`px-3 py-1 rounded border mx-1 cursor-pointer ${
            currentPage === i ? "bg-[#222432] text-white" : ""
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
        className="px-3 py-1 rounded border disabled:opacity-50 cursor-pointer"
      >
        &gt;
      </button>
    );

    return buttons;
  };

  // Add this near the top of your component, after your state declarations
  // This will read the URL parameters when the component mounts
  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get("category");

    // If a category is specified in the URL, set it as the active filter
    if (categoryParam && categories.includes(categoryParam)) {
      setActiveFilter(categoryParam);
    }
  }, []);

  // Handle temp location checkbox change
  const handleTempLocationChange = (location: string) => {
    setTempSelectedLocations(
      tempSelectedLocations.includes(location) ? [] : [location]
    );
  };

  // Apply location filter
  const applyLocationFilter = () => {
    setSelectedLocations(tempSelectedLocations);
    setShowLocationFilter(false);
    setCurrentPage(1);
  };

  // Apply price filter
  const applyPriceFilter = () => {
    setFreeOnly(tempFreeOnly);
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setSortOrder(tempSortOrder);
    setShowPriceFilter(false);
    setCurrentPage(1);
  };

  // Apply date filter
  const applyDateFilter = () => {
    setSelectedDate(tempSelectedDate);
    setSortOrder(tempSortOrder);
    setShowDateFilter(false);
    setCurrentPage(1);
  };

  // Handle temp price input change
  const handleTempPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "tempMinPrice") {
      setTempMinPrice(value);
    } else if (name === "tempMaxPrice") {
      setTempMaxPrice(value);
    }
  };

  return (
    <div className="bg-[#FAF0D7]">
      <div className="w-full px-6 py-10 max-w-screen-xl mx-auto">
        <h1 className="text-4xl font-semibold text-center mb-8">
          Discover Events
        </h1>

        {/* Search Section */}
        <div className="mb-8 max-w-xl mx-auto relative">
          <div className="relative">
            <input
              type="text"
              ref={searchInputRef}
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for events..."
              className="w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-black bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
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
              onClick={() => fetchEvents()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#222432] text-white px-4 py-1 rounded-full transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer"
            >
              Search
            </button>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
                        <div className="text-sm text-gray-500 text-left">
                          {suggestion.location}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                <li
                  className="p-3 text-center text-blue-600 hover:bg-gray-100 cursor-pointer font-medium"
                  onClick={() => fetchEvents()}
                >
                  See all results for "{searchQuery}"
                </li>
              </ul>
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
                    : "bg-white text-gray-800 hover:bg-gray-200"
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
                    ? "bg-[#222432] text-white"
                    : "bg-white text-gray-800 hover:bg-gray-200"
                }`}
              >
                Location{" "}
                {selectedLocations.length > 0 &&
                  `(${selectedLocations.length})`}
              </button>

              {showLocationFilter && (
                <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4 w-64">
                  <div className="mb-3 max-h-60 overflow-y-auto">
                    {locations.length > 0 ? (
                      locations.map((location) => (
                        <label
                          key={location}
                          className="flex items-center text-sm font-medium text-gray-700 mb-2"
                        >
                          <input
                            type="checkbox"
                            checked={tempSelectedLocations.includes(location)}
                            onChange={() => handleTempLocationChange(location)}
                            className="mr-2"
                          />
                          {location}
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        Loading locations...
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        // Clear temp state
                        setTempSelectedLocations([]);
                        // Also clear actual state and close dropdown
                        setSelectedLocations([]);
                        setShowLocationFilter(false);
                        setCurrentPage(1);
                      }}
                      className="text-sm text-gray-600"
                    >
                      Clear
                    </button>
                    <button
                      onClick={applyLocationFilter}
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
                    : "bg-white text-gray-800 hover:bg-gray-200"
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
                        checked={tempFreeOnly}
                        onChange={(e) => {
                          setTempFreeOnly(e.target.checked);
                          if (e.target.checked) {
                            setTempMinPrice("");
                            setTempMaxPrice("");
                          }
                        }}
                        className="mr-2"
                      />
                      Free events only
                    </label>

                    <div
                      className={`space-y-2 ${
                        tempFreeOnly ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Price (Rp)
                        </label>
                        <input
                          type="number"
                          value={tempMinPrice}
                          onChange={handleTempPriceChange}
                          name="tempMinPrice"
                          className="w-full p-2 border rounded text-sm"
                          placeholder="0"
                          min="0"
                          disabled={tempFreeOnly}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Price (Rp)
                        </label>
                        <input
                          type="number"
                          value={tempMaxPrice}
                          onChange={handleTempPriceChange}
                          name="tempMaxPrice"
                          className="w-full p-2 border rounded text-sm"
                          placeholder="1000000"
                          min="0"
                          disabled={tempFreeOnly}
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
                      value={tempSortOrder}
                      onChange={(e) => setTempSortOrder(e.target.value)}
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
                        // Clear temp state
                        setTempFreeOnly(false);
                        setTempMinPrice("");
                        setTempMaxPrice("");
                        // Also clear actual state and close dropdown
                        setFreeOnly(false);
                        setMinPrice("");
                        setMaxPrice("");
                        setShowPriceFilter(false);
                        setCurrentPage(1);
                      }}
                      className="text-sm text-gray-600"
                    >
                      Clear
                    </button>
                    <button
                      onClick={applyPriceFilter}
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
                    : "bg-white text-gray-800 hover:bg-gray-200"
                }`}
              >
                Date
              </button>

              {showDateFilter && (
                <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4">
                  <Calendar
                    onChange={(date) => setTempSelectedDate(date as Date)}
                    value={tempSelectedDate}
                    minDate={new Date()}
                    className="border-0"
                  />

                  {/* Sort options */}
                  <div className="mt-3 mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort by Date
                    </label>
                    <select
                      value={tempSortOrder}
                      onChange={(e) => setTempSortOrder(e.target.value)}
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
                        // Clear temp state
                        setTempSelectedDate(null);
                        // Also clear actual state and close dropdown
                        setSelectedDate(null);
                        setShowDateFilter(false);
                        setCurrentPage(1);
                      }}
                      className="text-sm text-gray-600"
                    >
                      Clear
                    </button>
                    <button
                      onClick={applyDateFilter}
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
                  <span className="ml-1">
                    in {selectedLocations.join(", ")}
                  </span>
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
                  {formatEventDates(event.start_date, event.end_date)}
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
    </div>
  );
}
