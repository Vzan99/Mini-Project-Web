import { Suspense } from "react";
import TransactionClient from "./TransactionClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransactionClient />
    </Suspense>
  );
}
