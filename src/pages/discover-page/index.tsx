"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import SearchBar from "@/app/components/searchbar";
import { format } from "date-fns";

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
};

const categories = [
  "All Events",
  "Concert",
  "Festival",
  "Comedy",
  "Museum",
  "Others",
];

export default function DiscoverPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeFilter, setActiveFilter] = useState("All Events");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Add the Cloudinary base URL
  const cloudinaryBaseUrl =
    "https://res.cloudinary.com/dnb5cxo2m/image/upload/";

  // Fetch all available locations for the dropdown
  const fetchLocations = async () => {
    try {
      const res = await axios.get("http://localhost:8000/events/locations");
      setLocations(res.data.locations || []);
      setFilteredLocations(res.data.locations || []);
    } catch (err) {
      console.error("Failed to fetch locations:", err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `http://localhost:8000/events/filter?limit=20`;

      // Add category filter if not "All Events"
      if (activeFilter !== "All Events") {
        url += `&category=${activeFilter}`;
      }

      // Add location filter if selected
      if (selectedLocation) {
        url += `&location=${encodeURIComponent(selectedLocation)}`;
      }

      // Add date filter if selected
      if (selectedDate) {
        url += `&date=${selectedDate}`;
      }

      console.log("Fetching events with URL:", url);

      const res = await axios.get(url);
      setEvents(res.data.events || []);
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

  useEffect(() => {
    fetchEvents();
  }, [activeFilter, selectedLocation, selectedDate]);

  useEffect(() => {
    fetchLocations();

    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter locations based on search query
  useEffect(() => {
    if (locationQuery) {
      const filtered = locations.filter((location) =>
        location.toLowerCase().includes(locationQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locations);
    }
  }, [locationQuery, locations]);

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setShowLocationDropdown(false);
    setLocationQuery("");
  };

  const clearLocationFilter = () => {
    setSelectedLocation("");
  };

  const clearDateFilter = () => {
    setSelectedDate("");
  };

  return (
    <div className="w-full px-6 py-10 max-w-screen-xl mx-auto">
      <h1 className="text-4xl font-semibold text-center mb-8">
        Discover Events
      </h1>

      {/* Search Bar */}
      <div className="mb-8 max-w-xl mx-auto">
        <SearchBar />
      </div>

      {/* Filter Section */}
      <div className="mb-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeFilter === category
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Location and Date Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {/* Location Filter */}
          <div className="relative" ref={locationRef}>
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                selectedLocation
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <span>{selectedLocation || "Location"}</span>
              {selectedLocation && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    clearLocationFilter();
                  }}
                  className="ml-1 text-xs bg-gray-700 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ×
                </span>
              )}
            </button>

            {showLocationDropdown && (
              <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Search locations..."
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredLocations.length === 0 ? (
                    <p className="p-3 text-sm text-gray-500">
                      No locations found
                    </p>
                  ) : (
                    filteredLocations.map((location) => (
                      <div
                        key={location}
                        onClick={() => handleLocationSelect(location)}
                        className="p-3 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {location}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div className="relative" ref={dateRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                selectedDate
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <span>
                {selectedDate
                  ? format(new Date(selectedDate), "dd MMM yyyy")
                  : "Date"}
              </span>
              {selectedDate && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDateFilter();
                  }}
                  className="ml-1 text-xs bg-gray-700 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ×
                </span>
              )}
            </button>

            {showDatePicker && (
              <div className="absolute z-10 mt-2 bg-white rounded-lg shadow-lg p-4 w-64">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={clearDateFilter}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
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
        {(selectedLocation || selectedDate) && (
          <div className="flex justify-center mb-4">
            <div className="text-sm text-gray-600">
              Filtering:
              {activeFilter !== "All Events" && (
                <span className="ml-1">{activeFilter}</span>
              )}
              {selectedLocation && (
                <span className="ml-1">in {selectedLocation}</span>
              )}
              {selectedDate && (
                <span className="ml-1">
                  on {format(new Date(selectedDate), "dd MMM yyyy")}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <p className="text-center text-gray-500">Loading events...</p>
      )}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && events.length === 0 && (
        <p className="text-center text-gray-400">No events found.</p>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition"
          >
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

            <div className="p-4 flex flex-col gap-2">
              <h2 className="text-lg font-semibold">{event.name}</h2>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
