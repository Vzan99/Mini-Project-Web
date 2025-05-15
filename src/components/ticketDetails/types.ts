export interface ITicket {
  id: string;
  transaction_id: string;
  user_id: string;
  event_id: string;
  ticket_code: string;
  status: string;
  created_at: string;
  updated_at: string;
  event?: {
    name: string;
    start_date: string;
    end_date: string;
    location: string;
    event_image: string;
  };
  transaction?: {
    created_at: string;
    quantity: number;
    total_pay_amount: number;
    attend_date: string;
  };
}

export interface ITransaction {
  id: string;
  event_id: string;
  quantity: number;
  attend_date: string;
  status: string;
  total_price: number;
  event?: {
    name: string;
    location: string;
    event_image: string;
  };
}
