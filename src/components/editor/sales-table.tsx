// src/components/editor/sales-table.tsx
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
    <div className="w-full overflow-auto scrollbar-thin">
      <div className="min-w-[800px]">
        <div className="overflow-auto bg-card">
          <Table className="border-collapse">
            <TableHeader className="bg-muted/30 sticky top-0">
              <TableRow>
                <TableHead className="w-10 text-center border border-border/40 p-1 text-foreground font-medium">
                  #
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center text-foreground font-medium">
                    OPP_CREATED_DATE
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center text-foreground font-medium">
                    OPP_CREATED_WEEK
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center text-foreground font-medium">
                    OPP_CREATED_DOW
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center text-foreground font-medium">
                    OPP_OWNER
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center text-foreground font-medium">
                    STAGE_NAME
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center text-foreground font-medium">
                    OPP_AMOUNT
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap border border-border/40 p-1">
                  <div className="flex items-center justify-center text-foreground font-medium">
                    OPP_COUNT
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((row, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-muted/50 h-7 transition-colors duration-150"
                >
                  <TableCell className="text-center font-medium text-sm border border-border/30 p-1 text-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap text-sm border border-border/30 p-1 text-foreground">
                    {row.opp_created_date}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap text-sm border border-border/30 p-1 text-foreground">
                    {row.opp_created_week}
                  </TableCell>
                  <TableCell className="text-center text-sm border border-border/30 p-1 text-foreground">
                    {row.opp_created_dow}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm border border-border/30 p-1 text-foreground">
                    {row.opp_owner}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm border border-border/30 p-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.stage_name === "Closed Won"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : row.stage_name === "Negotiation"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : row.stage_name === "Proposal"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : row.stage_name === "Discovery"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {row.stage_name}
                    </span>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap text-sm border border-border/30 p-1 text-foreground font-mono">
                    ${row.opp_amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center text-sm border border-border/30 p-1 text-foreground">
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
