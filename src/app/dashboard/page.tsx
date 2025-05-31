import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { DataTable } from "@/components/dashboard/data-table";
import { SectionCards } from "@/components/dashboard/section-cards";

import data from "./data.json";

export function Page() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Danh sách bài tập
          </h1>
          <p className="text-muted-foreground">
            Luyện tập hằng ngày với nhiều dạng truy vấn SQL
          </p>
        </div>
      </div>
      <DataTable data={data} />
    </div>
  );
}
