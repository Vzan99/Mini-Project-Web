// Review form values interface
export interface IReviewFormValues {
  rating: number;
  comment: string;
}

// Organizer interface
interface IOrganizer {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
}

// Transaction interface
interface ITransaction {
  id: string;
  // Add other transaction fields as needed
}

// Voucher interface
interface IVoucher {
  id: string;
  code: string;
  discount_amount: number;
  start_date?: string;
  end_date?: string;
  max_usage?: number;
  current_usage?: number;
}

// Review interface
interface IReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    username: string;
  };
}

// Event details interface
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