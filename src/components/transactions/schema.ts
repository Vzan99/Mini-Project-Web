import * as Yup from "yup";
import { TransactionFormValues } from "./types";

export const transactionInitialValues = (
  event_id: string = "",
  quantity: number = 1,
  start_date: string = ""
): TransactionFormValues => ({
  event_id,
  quantity,
  attend_date: start_date,
  use_voucher: true,
  voucher_code: "",
  use_coupon: false,
  coupon_code: "",
  use_points: false,
  points_to_use: 0,
  payment_method: "creditCard",
});

export const transactionValidationSchema = (availablePoints: number) =>
  Yup.object({
    quantity: Yup.number()
      .required("Quantity is required")
      .min(1, "Minimum 1 ticket")
      .max(3, "Maximum 3 tickets"),
    attend_date: Yup.string().required("Please select a date to attend"),
    voucher_code: Yup.string(),
    coupon_code: Yup.string(),
    points_to_use: Yup.number().when("usePoints", {
      is: true,
      then: (schema) =>
        schema
          .required("Points amount is required")
          .min(1, "Minimum 1 point")
          .max(availablePoints, `Maximum ${availablePoints} points`),
    }),
    payment_method: Yup.string().required("Payment method is required"),
  });
