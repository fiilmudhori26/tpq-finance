import { Suspense } from "react";
import SantriView from "@/components/features/santri-view";

export default function SantriPage() {
  return (
    <Suspense>
      <SantriView />
    </Suspense>
  );
}
