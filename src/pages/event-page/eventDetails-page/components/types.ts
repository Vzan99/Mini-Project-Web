interface IOrganizer {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
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
}
