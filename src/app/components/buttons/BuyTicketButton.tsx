'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type BuyTicketButtonProps = {
  eventId: string;
  eventName: string;
};

export default function BuyTicketButton({ 
  eventId, 
  eventName 
}: BuyTicketButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleBuyTicket = async () => {
    setIsLoading(true);
    
    try {
      // For now, just redirect to a checkout page
      // In a real implementation, you might want to:
      // 1. Check if the user is logged in
      // 2. Create a transaction in your backend
      // 3. Redirect to payment page
      
      router.push(`/checkout?eventId=${eventId}`);
      
      // Example of how you might create a transaction:
      // const response = await fetch('http://localhost:8000/transactions', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${userToken}` // You'd need to get this from your auth system
      //   },
      //   body: JSON.stringify({
      //     eventId,
      //     quantity: 1,
      //     // other required fields
      //   })
      // });
      
      // if (response.ok) {
      //   const data = await response.json();
      //   router.push(`/payment?transactionId=${data.data.id}`);
      // } else {
      //   throw new Error('Failed to create transaction');
      // }
    } catch (error) {
      console.error('Error processing ticket purchase:', error);
      alert('Sorry, there was an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleBuyTicket}
      disabled={isLoading}
      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        'Buy Tickets'
      )}
    </button>
  );
}