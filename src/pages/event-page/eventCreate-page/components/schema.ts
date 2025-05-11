import * as Yup from "yup";

// Define the form values interface
export interface EventFormValues {
  name: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  description: string;
  location: string;
  price: number;
  total_seats: number;
  category: string;
  // Add voucher fields
  create_voucher: boolean;
  voucher_code: string;
  discount_amount: number;
  voucher_start_date: string;
  voucher_start_time: string;
  voucher_end_date: string;
  voucher_end_time: string;
  max_usage: number;
}

// Initial form values with correct case for category
export const eventInitialValues: EventFormValues = {
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

// Validation schema
export const eventValidationSchema = Yup.object({
  name: Yup.string()
    .required("Event name is required")
    .max(100, "Name must be 100 characters or less"),
  start_date: Yup.string().required("Start date is required"),
  start_time: Yup.string().required("Start time is required"),
  end_date: Yup.string().required("End date is required"),
  end_time: Yup.string().required("End time is required"),
  description: Yup.string()
    .required("Description is required")
    .max(2000, "Description must be 2000 characters or less"),
  location: Yup.string()
    .required("Location is required")
    .max(100, "Location must be 100 characters or less"),
  price: Yup.number()
    .min(0, "Price cannot be negative")
    .required("Price is required"),
  total_seats: Yup.number()
    .min(1, "Total seats must be at least 1")
    .required("Total seats is required"),
  category: Yup.string()
    .required("Category is required")
    .oneOf(
      ["Concert", "Festival", "Comedy", "Museum", "Others"],
      "Invalid category"
    ),
  // Add voucher validation
  create_voucher: Yup.boolean(),
  voucher_code: Yup.string().when("createVoucher", {
    is: true,
    then: (schema) =>
      schema
        .required("Voucher code is required")
        .min(5, "Voucher code must be at least 5 characters"),
  }),
  discount_amount: Yup.number().when("createVoucher", {
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
  voucher_start_date: Yup.string().when("createVoucher", {
    is: true,
    then: (schema) => schema.required("Voucher start date is required"),
  }),
  voucher_start_time: Yup.string().when("createVoucher", {
    is: true,
    then: (schema) => schema.required("Voucher start time is required"),
  }),
  voucher_end_date: Yup.string().when("createVoucher", {
    is: true,
    then: (schema) => schema.required("Voucher end date is required"),
  }),
  voucher_end_time: Yup.string().when("createVoucher", {
    is: true,
    then: (schema) => schema.required("Voucher end time is required"),
  }),
  max_usage: Yup.number().when("createVoucher", {
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
            return !value || value <= this.parent.totalSeats;
          }
        ),
  }),
});
