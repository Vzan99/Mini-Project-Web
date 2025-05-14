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
  keyword?: string;
  category?: string;
  location?: string;
  min_price?: string;
  max_price?: string;
  free_only?: boolean;
  specific_date?: Date | null;
  sort_by?: "name" | "price" | "start_date" | "location" | "created_at";
  sort_order?: "asc" | "desc";
  available_seats_only?: boolean;
  page: number;
  limit: number;
}

export interface IDiscoverPageProps {
  initialCategory?: string;
}
