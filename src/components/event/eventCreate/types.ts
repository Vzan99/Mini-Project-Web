export interface IEventFormValues {
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
  create_voucher: boolean;
  voucher_code: string;
  discount_amount: number;
  voucher_start_date: string;
  voucher_start_time: string;
  voucher_end_date: string;
  voucher_end_time: string;
  max_usage: number;
}
