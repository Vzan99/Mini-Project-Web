import * as Yup from "yup";
import { IEventFormValues } from "./types";

// Initial form values with correct case for category
export const eventInitialValues: IEventFormValues = {
  name: "",
  start_date: "",
  start_time: "",
  end_date: "",
  end_time: "",
  description: "",
  location: "",
  price: 0,
  total_seats: 1,
  category: "Concert", // Default category with correct case
  // Add voucher initial values
  create_voucher: false,
  voucher_code: "",
  discount_amount: 0,
  voucher_start_date: "",
  voucher_start_time: "",
  voucher_end_date: "",
  voucher_end_time: "",
  max_usage: 1,
};

// Get tomorrow's date for min attribute
const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0]; // Returns YYYY-MM-DD
};

// Validation schema
export const eventValidationSchema = Yup.object({
  name: Yup.string()
    .required("Event name is required")
    .max(100, "Name must be 100 characters or less"),
  start_date: Yup.string()
    .required("Start date is required")
    .test(
      "start-date-future",
      "Start date must be in the future",
      function (value) {
        if (!value) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        return new Date(value) > today;
      }
    ),
  start_time: Yup.string().required("Start time is required"),
  end_date: Yup.string()
    .required("End date is required")
    .test(
      "end-date-after-start-date",
      "End date must be on or after start date",
      function (value) {
        const { start_date } = this.parent;
        if (!value || !start_date) return true;
        return new Date(value) >= new Date(start_date);
      }
    ),
  end_time: Yup.string()
    .required("End time is required")
    .test(
      "end-time-valid",
      "End time must be after start time if dates are the same",
      function (value) {
        const { start_date, end_date, start_time } = this.parent;
        if (!value || !start_time || !start_date || !end_date) return true;

        // Only validate time if dates are the same
        if (start_date === end_date) {
          return value > start_time;
        }
        return true;
      }
    ),
  description: Yup.string()
    .required("Description is required")
    .max(2000, "Description must be 2000 characters or less"),
  location: Yup.string()
    .required("Location is required")
    .max(100, "Location must be 100 characters or less"),
  price: Yup.number()
    .min(0, "Price cannot be negative")
    .required("Price is required")
    .integer("Price must be a whole number"),
  total_seats: Yup.number()
    .min(1, "Total seats must be at least 1")
    .required("Total seats is required")
    .integer("Total seats must be a whole number"),
  category: Yup.string()
    .required("Category is required")
    .oneOf(
      ["Concert", "Festival", "Comedy", "Museum", "Others"],
      "Invalid category"
    ),
  // Add voucher validation
  create_voucher: Yup.boolean(),
  voucher_code: Yup.string().when("create_voucher", {
    is: true,
    then: (schema) =>
      schema
        .required("Voucher code is required")
        .min(5, "Voucher code must be at least 5 characters"),
  }),
  discount_amount: Yup.number().when("create_voucher", {
    is: true,
    then: (schema) =>
      schema
        .required("Discount amount is required")
        .positive("Discount amount must be greater than zero")
        .test(
          "discount-less-than-price",
          "Discount cannot exceed event price",
          function (value) {
            return !value || value <= this.parent.price;
          }
        ),
  }),
  voucher_start_date: Yup.string().when("create_voucher", {
    is: true,
    then: (schema) =>
      schema
        .required("Voucher start date is required")
        .test(
          "voucher-start-date-valid",
          "Voucher start date must be no earlier than yesterday",
          function (value) {
            if (!value) return true;

            // Allow dates from yesterday onwards
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0); // Start of yesterday

            return new Date(value) >= yesterday;
          }
        ),
  }),
  voucher_start_time: Yup.string().when("create_voucher", {
    is: true,
    then: (schema) => schema.required("Voucher start time is required"),
  }),
  voucher_end_date: Yup.string().when("create_voucher", {
    is: true,
    then: (schema) =>
      schema
        .required("Voucher end date is required")
        .test(
          "voucher-end-date-valid",
          "Voucher end date must be on or before event end date",
          function (value) {
            if (!value || !this.parent.end_date) return true;
            return new Date(value) <= new Date(this.parent.end_date);
          }
        )
        .test(
          "voucher-end-after-start",
          "Voucher end date must be after voucher start date",
          function (value) {
            if (!value || !this.parent.voucher_start_date) return true;
            return new Date(value) >= new Date(this.parent.voucher_start_date);
          }
        ),
  }),
  voucher_end_time: Yup.string().when("create_voucher", {
    is: true,
    then: (schema) => schema.required("Voucher end time is required"),
  }),
  max_usage: Yup.number().when("create_voucher", {
    is: true,
    then: (schema) =>
      schema
        .required("Max usage is required")
        .positive("Max usage must be greater than zero")
        .integer("Max usage must be a whole number")
        .test(
          "max-usage-less-than-seats",
          "Max usage cannot exceed total seats",
          function (value) {
            return !value || value <= this.parent.total_seats;
          }
        ),
  }),
});
