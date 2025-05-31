import { HistoryTable } from "@/components/history/history-table";

import data from "./data.json";

export function HistoryPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Lịch sử submission
          </h1>
          <p className="text-muted-foreground">
            Theo dõi lịch sử các bài tập đã submit và kết quả chi tiết
          </p>
        </div>
      </div>
      <HistoryTable data={data} />
    </div>
  );
}
