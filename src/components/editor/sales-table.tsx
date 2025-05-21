"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { SalesDataItem } from "@/types/sales";

// Import từ file dữ liệu với kiểu chính xác
import salesDataJson from "./data/sales-mock-data.json";
const salesData: SalesDataItem[] = salesDataJson as SalesDataItem[];

export function SalesTable() {
  // Always show table layout, allow horizontal scroll on mobile
  return (
    <div className="w-full overflow-auto">
      <div className="min-w-[800px]">
        <div className="overflow-auto bg-card">
          <Table className="border-collapse">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-10 text-center border border-border/40 p-1">
                  #
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center">
                    OPP_CREATED_DATE
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center">
                    OPP_CREATED_WEEK
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center">
                    OPP_CREATED_DOW
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center">
                    OPP_OWNER
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center">
                    STAGE_NAME
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center">
                    OPP_AMOUNT
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center">
                    OPP_COUNT
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((row, index) => (
                <TableRow key={index} className="hover:bg-muted/50 h-7">
                  <TableCell className="text-center font-medium text-sm border border-border/30 p-1">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap text-sm border border-border/30 p-1">
                    {row.opp_created_date}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap text-sm border border-border/30 p-1">
                    {row.opp_created_week}
                  </TableCell>
                  <TableCell className="text-center text-sm border border-border/30 p-1">
                    {row.opp_created_dow}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm border border-border/30 p-1">
                    {row.opp_owner}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm border border-border/30 p-1">
                    {row.stage_name}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap text-sm border border-border/30 p-1">
                    {row.opp_amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center text-sm border border-border/30 p-1">
                    {row.opp_count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
