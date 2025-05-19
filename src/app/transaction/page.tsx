import { Suspense } from "react";
import TransactionClient from "./TransactionClient";
import LoadingSpinnerScreen from "@/components/loadings/loadingSpinnerScreen";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinnerScreen />}>
      <TransactionClient />
    </Suspense>
  );
}
