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

const salesData = [
  {
    opp_created_date: "05/13/2024",
    opp_created_week: "05/13/2024",
    opp_created_dow: 7,
    opp_owner: "Chase Watts",
    stage_name: "Closed Won",
    opp_amount: 5000,
    opp_count: 1,
  },
  {
    opp_created_date: "05/13/2024",
    opp_created_week: "05/13/2024",
    opp_created_dow: 7,
    opp_owner: "Bailey Matthews",
    stage_name: "Closed Won",
    opp_amount: 15000,
    opp_count: 1,
  },
  {
    opp_created_date: "05/12/2024",
    opp_created_week: "05/06/2024",
    opp_created_dow: 6,
    opp_owner: "Jordan Lee",
    stage_name: "Negotiation",
    opp_amount: 8500,
    opp_count: 1,
  },
  {
    opp_created_date: "05/10/2024",
    opp_created_week: "05/06/2024",
    opp_created_dow: 4,
    opp_owner: "Alex Rivera",
    stage_name: "Proposal",
    opp_amount: 12000,
    opp_count: 1,
  },
  {
    opp_created_date: "05/09/2024",
    opp_created_week: "05/06/2024",
    opp_created_dow: 3,
    opp_owner: "Taylor Kim",
    stage_name: "Discovery",
    opp_amount: 7500,
    opp_count: 1,
  },
  {
    opp_created_date: "05/08/2024",
    opp_created_week: "05/06/2024",
    opp_created_dow: 2,
    opp_owner: "Morgan Smith",
    stage_name: "Qualification",
    opp_amount: 4000,
    opp_count: 1,
  },
];

export function SalesTable() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-7 border-b">
        <div className="flex items-center p-2 border-r">
          <div className="w-10 text-center font-medium">A1</div>
          <div className="ml-2 font-medium">OPP_CREATED_DATE</div>
        </div>
        <div className="flex justify-center items-center p-2 border-r">
          <div className="font-medium flex items-center">
            <span className="text-purple-600 mr-1">↑</span>
            <span>A</span>
          </div>
        </div>
        <div className="flex justify-center items-center p-2 border-r">
          <div className="font-medium flex items-center">
            <span className="text-purple-600 mr-1">↑</span>
            <span>B</span>
          </div>
        </div>
        <div className="flex justify-center items-center p-2 border-r">
          <div className="font-medium flex items-center">
            <span className="text-purple-600 mr-1">↑</span>
            <span>C</span>
          </div>
        </div>
        <div className="flex justify-center items-center p-2 border-r">
          <div className="font-medium flex items-center">
            <span className="text-purple-600 mr-1">↑</span>
            <span>D</span>
          </div>
        </div>
        <div className="flex justify-center items-center p-2 border-r">
          <div className="font-medium flex items-center">
            <span className="text-purple-600 mr-1">↑</span>
            <span>E</span>
          </div>
        </div>
        <div className="flex justify-center items-center p-2">
          <div className="font-medium flex items-center">
            <span className="text-purple-600 mr-1">↑</span>
            <span>F</span>
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead className="cursor-pointer">
              <div className="flex items-center justify-center">
                OPP_CREATED_DATE
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer">
              <div className="flex items-center justify-center">
                OPP_CREATED_WEEK
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer">
              <div className="flex items-center justify-center">
                OPP_CREATED_DOW
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer">
              <div className="flex items-center justify-center">
                OPP_OWNER
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer">
              <div className="flex items-center justify-center">
                STAGE_NAME
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer">
              <div className="flex items-center justify-center">
                OPP_AMOUNT
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer">
              <div className="flex items-center justify-center">
                OPP_COUNT
                <ArrowUpDown className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salesData.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="text-center font-medium">
                {index + 1}
              </TableCell>
              <TableCell className="text-center">
                {row.opp_created_date}
              </TableCell>
              <TableCell className="text-center">
                {row.opp_created_week}
              </TableCell>
              <TableCell className="text-center">
                {row.opp_created_dow}
              </TableCell>
              <TableCell>{row.opp_owner}</TableCell>
              <TableCell>{row.stage_name}</TableCell>
              <TableCell className="text-right">
                {row.opp_amount.toLocaleString()}
              </TableCell>
              <TableCell className="text-center">{row.opp_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
