import * as Yup from "yup";

export const reviewValidationSchema = Yup.object({
  rating: Yup.number()
    .min(1, "Please select a rating")
    .required("Rating is required"),
  comment: Yup.string()
    .required("Please write a review")
    .max(500, "Review must be 500 characters or less"),
});
