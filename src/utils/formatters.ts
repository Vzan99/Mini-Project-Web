/**
 * Formats a number with commas as thousands separators
 * @param num The number to format
 * @returns Formatted string with commas
 */
export const formatNumberWithCommas = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};