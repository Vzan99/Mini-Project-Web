// Format number with commas (e.g., 1000 -> 1,000)
export function formatNumberWithCommas(num?: number | null): string {
  if (typeof num !== "number" || isNaN(num)) return "0";
  return num.toLocaleString();
}

// Format date to locale string
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Format date with day
export const formatDateDetails = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return new Date(date).toLocaleDateString("en-GB", options);
};

// Format date without day
export const formatEventDates = (start_date: string, end_date: string) => {
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    };
    return new Date(date).toLocaleDateString("en-GB", options);
  };

  // Check if the event is a single day
  if (startDate.toDateString() === endDate.toDateString()) {
    return formatDate(start_date);
  }

  // Check if the event spans within the same month
  if (
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    // Only show day range without repeating the month
    return `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleString(
      "en-GB",
      { month: "long" }
    )} ${startDate.getFullYear()}`;
  } else {
    return `${formatDate(start_date)} - ${formatDate(end_date)}`;
  }
};

// Format Date for input (YYYY-MM-DD)
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Format time to locale string
export const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourFormatted = hour.toString().padStart(2, "0");
    const time = `${hourFormatted}:00`;
    // Format for display (24-hour format)
    const displayTime = `${hourFormatted}:00`;
    options.push({ value: time, label: displayTime });
  }
  return options;
};
