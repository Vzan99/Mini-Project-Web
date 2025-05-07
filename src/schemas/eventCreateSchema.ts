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
}

// Initial form values
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
  category: "concert", // Default category
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
  category: Yup.string().required("Category is required"),
});