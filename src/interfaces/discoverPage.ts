export interface IEventDiscover {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  price: number;
  start_date: string;
  end_date: string;
  event_image?: string | null;
  remaining_seats: number;
}

export interface IEventSuggestion {
  id: string;
  name: string;
  location: string;
  event_image?: string | null;
}

export interface IFilterState {
  category: string;
  locations: string[];
  date: Date | null;
  minPrice: string;
  maxPrice: string;
  freeOnly: boolean;
  sortOrder: string;
}

export interface IDiscoverPageProps {
  initialCategory?: string;
}
