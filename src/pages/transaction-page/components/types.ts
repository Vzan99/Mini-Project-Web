import * as Yup from "yup";

// Transaction form values interface
export interface TransactionFormValues {
  eventId: string;
  quantity: number;
  attendDate: string;
  useVoucher: boolean;
  voucherCode: string;
  useCoupon: boolean;
  couponCode: string;
  usePoints: boolean;
  pointsToUse: number;
  paymentMethod: string;
}

// Initial values for the transaction form
export const transactionInitialValues = (
  eventId: string = "",
  quantity: number = 1,
  startDate: string = ""
): TransactionFormValues => ({
  eventId,
  quantity,
  attendDate: startDate, // Use the provided start date
  useVoucher: true, // Default to voucher
  voucherCode: "",
  useCoupon: false,
  couponCode: "",
  usePoints: false,
  pointsToUse: 0,
  paymentMethod: "creditCard",
});

// Validation schema for the transaction form
export const transactionValidationSchema = (availablePoints: number) =>
  Yup.object({
    quantity: Yup.number()
      .required("Quantity is required")
      .min(1, "Minimum 1 ticket")
      .max(3, "Maximum 3 tickets"),
    attendDate: Yup.string().required("Please select a date to attend"),
    voucherCode: Yup.string(), // Make voucher code optional
    couponCode: Yup.string(), // Make coupon code optional
    pointsToUse: Yup.number().when("usePoints", {
      is: true,
      then: (schema) =>
        schema
          .required("Points amount is required")
          .min(1, "Minimum 1 point")
          .max(availablePoints, `Maximum ${availablePoints} points`),
    }),
    paymentMethod: Yup.string().required("Payment method is required"),
  });
