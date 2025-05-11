import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import { clearCurrentTransaction } from "@/lib/redux/features/transactionSlice";

interface BuyTicketButtonProps {
  eventId: string;
  className?: string;
}

export default function BuyTicketButton({ eventId, className = "" }: BuyTicketButtonProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const handleClick = () => {
    // Clear any existing transaction data
    dispatch(clearCurrentTransaction());
    
    // Navigate to checkout with the event ID
    router.push(`/checkout?eventId=${eventId}`);
  };
  
  return (
    <button 
      onClick={handleClick}
      className={`bg-[#222432] text-white py-2 px-4 rounded-lg font-medium hover:bg-opacity-90 ${className}`}
    >
      Buy Ticket
    </button>
  );
}