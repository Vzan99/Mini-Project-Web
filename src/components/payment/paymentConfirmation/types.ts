export interface IAcceptedTransaction {
  id: string;
  event_id: string;
  user_id: string;
  quantity: number;
  attend_date: string;
  voucher_code?: string;
  coupon_code?: string;
  points_used: number;
  payment_method: string;
  total_price: number;
  voucher_discount?: number;
  coupon_discount?: number;
  status:
    | "waiting_for_payment"
    | "waiting_for_admin_confirmation"
    | "confirmed"
    | "rejected"
    | "expired"
    | "canceled";
  created_at: string;
  updated_at: string;
  total_pay_amount: number;
  tickets: any[];
}

interface IOrganizer {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
}

interface ITransaction {
  id: string;
}

interface IVoucher {
  id: string;
  code: string;
  discount_amount: number;
  start_date?: string;
  end_date?: string;
  max_usage?: number;
  current_usage?: number;
  event_id?: string;
}

interface IReview {
  id: string;
}

export interface IEventDetails {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  description: string;
  event_image: string;
  location: string;
  price: number;
  total_seats: number;
  remaining_seats: number;
  category: string;
  organizer_id: string;
  organizer: IOrganizer;
  transactions: ITransaction[];
  voucher: IVoucher[];
  review: IReview[];
  created_at?: string;
  updated_at?: string;
}
