interface IReview {
  id: string;
  rating: number;
  review: string;
  created_at: string;
  user: {
    username: string;
  };
  event_name?: string;
  event_id?: string;
}

export interface IEventSummary {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  price: number;
  total_seats: number;
  remaining_seats: number;
  category: string;
  event_image: string;
  total_reviews: number;
}

interface IOrganizerInfo {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
}

export interface IOrganizerProfile {
  organizer: IOrganizerInfo;
  average_rating: number;
  total_reviews: number;
  reviews: IReview[];
  events: IEventSummary[];
}
