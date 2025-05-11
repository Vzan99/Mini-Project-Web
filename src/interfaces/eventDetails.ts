// interface IOrganizer {
//   id: string;
//   username: string;
//   first_name: string;
//   last_name: string;
// }

// interface ITransaction {
//   id: string;
//   // Add other transaction fields as needed
// }

// interface IVoucher {
//   id: string;
//   code: string; // From API response
//   voucherCode?: string; // From backend schema
//   discount_amount: number; // From API response
//   discountAmount?: number; // From backend schema
//   start_date?: string; // From API response
//   voucherStartDate?: Date; // From backend schema
//   end_date?: string; // From API response
//   voucherEndDate?: Date; // From backend schema
//   max_usage?: number; // From API response
//   maxUsage?: number; // From backend schema
//   current_usage?: number; // From API response
//   eventId?: string; // From backend schema
// }

// interface IReview {
//   id: string;
//   // Add other review fields as needed
// }

// export interface IEventDetails {
//   id: string;
//   name: string;
//   start_date: string;
//   end_date: string;
//   description: string;
//   event_image: string;
//   location: string;
//   price: number;
//   total_seats: number;
//   remaining_seats: number;
//   category: string;
//   organizer_id: string;
//   organizer: IOrganizer;
//   transactions: ITransaction[];
//   voucher: IVoucher[];
//   review: IReview[];
//   created_at?: string;
//   updated_at?: string;
// }
