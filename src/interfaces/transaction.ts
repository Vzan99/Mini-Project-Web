export interface ITransaction {
  id: string;
  eventId: string;
  userId: string;
  quantity: number;
  attendDate: string;
  voucherCode?: string;
  couponCode?: string;
  pointsUsed: number;
  paymentMethod: string;
  totalPrice: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}