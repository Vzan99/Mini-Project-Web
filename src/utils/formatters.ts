// Format number with commas (e.g., 1000 -> 1,000)
export const formatNumberWithCommas = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Format date to locale string
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Format date to locale string with details week
export const formatDateDetails = (date: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return new Date(date).toLocaleDateString("en-GB", options);
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
