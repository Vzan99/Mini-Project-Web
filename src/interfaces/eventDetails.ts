interface IOrganizer {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
}

interface ITransaction {
  id: string;
  // Add other transaction fields as needed
}

interface IVoucher {
  id: string;
  // Add other voucher fields as needed
}

interface IReview {
  id: string;
  // Add other review fields as needed
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
