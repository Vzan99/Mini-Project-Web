import * as Yup from "yup";

export const registerValidationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .trim()
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    )
    .required("Password is required"),
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  username: Yup.string()
    .min(5, "Username must be at least 5 characters")
    .required("Username is required"),
  referral_code: Yup.string().optional(),
  role: Yup.string()
    .oneOf(["customer", "event_organizer"])
    .required("Role is required"),
});
