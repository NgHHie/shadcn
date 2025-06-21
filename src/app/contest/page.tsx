// src/app/contest/page.tsx
import { ContestPage as Contest } from "@/components/contest/contest";

export function ContestPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <Contest />
      </div>
    </div>
  );
}
