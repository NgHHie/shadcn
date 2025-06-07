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

interface SalesTableProps {
  data?: any[]; // Optional prop for dynamic data
}

export function SalesTable({ data }: SalesTableProps = {}) {
  // Use provided data or fallback to mock data
  const tableData = data;

  if (!tableData) {
    return (
      <div className="w-full overflow-auto scrollbar-thin">
        <div>
          <div className="p-4 text-muted-foreground">
            <p>Kết quả truy vấn sẽ hiển thị tại đây.</p>
          </div>
        </div>
      </div>
    );
  } else if (tableData.length == 0) {
    return (
      <div className="w-full overflow-auto scrollbar-thin">
        <div>
          <div className="p-4 text-muted-foreground">
            <p>Không có dữ liệu.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get columns dynamically from data
  const columns = Object.keys(tableData[0]);

  // Helper function to format cell value
  const formatCellValue = (value: any, columnName: string) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic text-xs">null</span>;
    }

    // Handle specific column formatting for sales data
    if (
      columnName.toLowerCase().includes("amount") &&
      typeof value === "number"
    ) {
      return <span className="font-mono">${value.toLocaleString()}</span>;
    }

    // Handle stage_name with colored badges (if it exists)
    if (
      columnName.toLowerCase() === "stage_name" ||
      columnName.toLowerCase().includes("stage")
    ) {
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "Closed Won" || value === "CLOSED_WON"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : value === "Negotiation" || value === "NEGOTIATION"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : value === "Proposal" || value === "PROPOSAL"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              : value === "Discovery" || value === "DISCOVERY"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          }`}
        >
          {String(value)}
        </span>
      );
    }

    // Handle boolean values
    if (typeof value === "boolean") {
      return (
        <span
          className={`px-1.5 py-0.5 rounded text-xs ${
            value
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {value ? "TRUE" : "FALSE"}
        </span>
      );
    }

    return String(value);
  };

  return (
    <div className="w-full overflow-auto scrollbar-thin">
      <div className="min-w-[400px]">
        <div className="overflow-auto bg-card">
          <Table className="border-collapse">
            <TableHeader className="bg-muted/30 sticky top-0">
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className="cursor-pointer whitespace-nowrap border border-border/80 px-2 py-1"
                  >
                    <div className="flex items-center text-foreground font-medium text-xs">
                      {column.toLowerCase()}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-muted/50 h-6 transition-colors duration-150"
                >
                  {columns.map((column, colIndex) => {
                    const value = row[column];

                    return (
                      <TableCell
                        key={colIndex}
                        className="text-left whitespace-nowrap text-xs border border-border/70 px-2 py-0.5 text-foreground"
                      >
                        {formatCellValue(value, column)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
