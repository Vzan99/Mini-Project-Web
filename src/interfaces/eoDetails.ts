interface IReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    username: string;
  };
}

interface IEventSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  price: number;
  totalSeats: number;
  remainingSeats: number;
  category: string;
  eventImage: string;
  totalReviews: number;
}

interface IOrganizerInfo {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

export interface IOrganizerProfile {
  organizer: IOrganizerInfo;
  averageRating: number;
  totalReviews: number;
  reviews: IReview[];
  events: IEventSummary[];
}
