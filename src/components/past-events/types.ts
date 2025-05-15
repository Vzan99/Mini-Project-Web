export interface ITicket {
  id: string;
  ticket_code: string;
}

export interface ITransaction {
  id: string;
  event_id: string;
  status: string;
  tickets: ITicket[];
}

export interface IReview {
  id: string;
  rating: number;
  comment?: string;
  review?: string; // Some backends might use 'review' instead of 'comment'
}

export interface IPastEvent {
  id: string;
  name: string;
  event_image: string;
  location: string;
  end_date: string;
  review: IReview[];
  transactions: ITransaction[];
}

export interface IPagination {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}
