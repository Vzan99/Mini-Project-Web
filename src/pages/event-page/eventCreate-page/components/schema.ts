import * as Yup from "yup";

// Define the form values interface
export interface EventFormValues {
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
  location: string;
  price: number;
  totalSeats: number;
  category: string;
  // Add voucher fields
  createVoucher: boolean;
  voucherCode: string;
  discountAmount: number;
  voucherStartDate: string;
  voucherStartTime: string;
  voucherEndDate: string;
  voucherEndTime: string;
  maxUsage: number;
}

// Initial form values with correct case for category
export const eventInitialValues: EventFormValues = {
  name: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  description: "",
  location: "",
  price: 0,
  totalSeats: 1,
  category: "Concert", // Default category with correct case
  // Add voucher initial values
  createVoucher: false,
  voucherCode: "",
  discountAmount: 0,
  voucherStartDate: "",
  voucherStartTime: "",
  voucherEndDate: "",
  voucherEndTime: "",
  maxUsage: 1,
};

// Validation schema
export const eventValidationSchema = Yup.object({
  name: Yup.string()
    .required("Event name is required")
    .max(100, "Name must be 100 characters or less"),
  startDate: Yup.string().required("Start date is required"),
  startTime: Yup.string().required("Start time is required"),
  endDate: Yup.string().required("End date is required"),
  endTime: Yup.string().required("End time is required"),
  description: Yup.string()
    .required("Description is required")
    .max(2000, "Description must be 2000 characters or less"),
  location: Yup.string()
    .required("Location is required")
    .max(100, "Location must be 100 characters or less"),
  price: Yup.number()
    .min(0, "Price cannot be negative")
    .required("Price is required"),
  totalSeats: Yup.number()
    .min(1, "Total seats must be at least 1")
    .required("Total seats is required"),
  category: Yup.string()
    .required("Category is required")
    .oneOf(
      ["Concert", "Festival", "Comedy", "Museum", "Others"],
      "Invalid category"
    ),
  // Add voucher validation
  createVoucher: Yup.boolean(),
  voucherCode: Yup.string().when("createVoucher", {
    is: true,
    then: (schema) =>
      schema
        .required("Voucher code is required")
        .min(5, "Voucher code must be at least 5 characters"),
  }),
  discountAmount: Yup.number().when("createVoucher", {
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
  voucherStartDate: Yup.string().when("createVoucher", {
    is: true,
    then: (schema) => schema.required("Voucher start date is required"),
  }),
  voucherStartTime: Yup.string().when("createVoucher", {
    is: true,
    then: (schema) => schema.required("Voucher start time is required"),
  }),
  voucherEndDate: Yup.string().when("createVoucher", {
    is: true,
    then: (schema) => schema.required("Voucher end date is required"),
  }),
  voucherEndTime: Yup.string().when("createVoucher", {
    is: true,
    then: (schema) => schema.required("Voucher end time is required"),
  }),
  maxUsage: Yup.number().when("createVoucher", {
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
