"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Database,
  DollarSign,
  History,
  Percent,
  Table2,
  Terminal,
  Type,
} from "lucide-react";
import { SalesTable } from "@/components/editor/sales-table";
import {
  QueryHistoryPanel,
  type QueryHistoryItem,
} from "@/components/editor/query-history-panel";

export function SalesAnalyticsDashboard() {
  const [sqlQuery, setSqlQuery] = useState(`SELECT
  DATE_TRUNC('day', opp.created_date)::DATE AS opp_created_date
,DATE_TRUNC('week',opp.created_date)::DATE AS opp_created_week
,EXTRACT(DOW FROM opp.created_date::DATE) AS opp_created_dow
,u.name AS opp_owner
,opp.stage_name
,SUM(COALESCE(opp.amount,0)) AS opp_amount
,COUNT(opp.id) AS opp_count
FROM opportunity opp
LEFT JOIN user u ON u.id = opp.owner_id
WHERE 0=0
  AND opp.created_date >= CURRENT_DATE - INTERVAL '2 months'`);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  // Sample query history data
  const queryHistory: QueryHistoryItem[] = [
    {
      id: 1,
      time: "2024-05-22 14:32",
      status: "AC",
      duration: "8s",
      result: "5,240/5,240",
      dbType: "PostgreSQL",
    },
    {
      id: 2,
      time: "2024-05-22 13:15",
      status: "AC",
      duration: "6s",
      result: "4,120/4,120",
      dbType: "PostgreSQL",
    },
    {
      id: 3,
      time: "2024-05-21 16:45",
      status: "Error",
      duration: "2s",
      result: "0/0",
      dbType: "PostgreSQL",
    },
    {
      id: 4,
      time: "2024-05-21 11:20",
      status: "AC",
      duration: "12s",
      result: "8,760/8,760",
      dbType: "MySQL",
    },
    {
      id: 5,
      time: "2024-05-20 09:35",
      status: "AC",
      duration: "5s",
      result: "3,450/3,450",
      dbType: "PostgreSQL",
    },
  ];

  const handleSelectQuery = (query: QueryHistoryItem) => {
    console.log("Selected query:", query);
    // Here you would typically load the selected query
    setIsHistoryOpen(false);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between border-b p-2 bg-white">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Terminal className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-medium">File</span>
            <span className="font-medium">Edit</span>
            <span className="font-medium">View</span>
            <span className="font-medium">Insert</span>
            <span className="font-medium">Format</span>
            <span className="font-medium">Data</span>
            <span className="font-medium">Help</span>
          </div>
        </div>
        <div className="text-center font-medium">Sales Overview</div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={toggleHistory}
          >
            <History className="h-4 w-4" />
            <span>History</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <Table2 className="h-4 w-4" />
            <span>Table</span>
          </Button>
        </div>
      </header>

      <div className="flex items-center gap-2 border-b p-2 bg-white">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full bg-green-100 text-green-600"
          >
            <Terminal className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">SQL editor</span>
        </div>
        <div className="flex items-center gap-1 border-l pl-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Type className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <div className="flex flex-col items-center justify-center">
              <div className="h-0.5 w-4 bg-gray-600 mb-0.5"></div>
              <div className="h-0.5 w-3 bg-gray-600 mb-0.5"></div>
              <div className="h-0.5 w-2 bg-gray-600"></div>
            </div>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <div className="flex flex-col items-center justify-center">
              <div className="h-0.5 w-2 bg-gray-600 mb-0.5"></div>
              <div className="h-0.5 w-3 bg-gray-600 mb-0.5"></div>
              <div className="h-0.5 w-4 bg-gray-600"></div>
            </div>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <div className="flex flex-col items-center justify-center">
              <div className="h-0.5 w-4 bg-gray-600 mb-0.5"></div>
              <div className="h-0.5 w-4 bg-gray-600 mb-0.5"></div>
              <div className="h-0.5 w-4 bg-gray-600"></div>
            </div>
          </Button>
        </div>
        <div className="flex items-center gap-1 border-l pl-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <DollarSign className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Percent className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button variant="outline" size="sm" className="gap-1">
            <span>Month and Year</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center gap-2 p-2 bg-white border-b">
          <Database className="h-4 w-4 text-blue-500" />
          <span className="font-medium">Opportunities</span>
        </div>

        <div className="flex flex-col flex-1">
          <div className="p-4 bg-white border-b overflow-auto">
            <pre className="text-sm font-mono">
              <code className="grid">
                {sqlQuery.split("\n").map((line, i) => (
                  <div key={i} className="flex">
                    <span className="w-8 text-gray-400 select-none">
                      {i + 1}
                    </span>
                    <span className="text-purple-600">
                      {line.includes("SELECT")
                        ? "SELECT"
                        : line.includes("FROM")
                        ? "FROM"
                        : line.includes("LEFT JOIN")
                        ? "    LEFT JOIN"
                        : line.includes("WHERE")
                        ? "WHERE"
                        : line.includes("AND")
                        ? "    AND"
                        : ""}
                    </span>
                    <span className="text-black">
                      {line.replace(/SELECT|FROM|LEFT JOIN|WHERE|AND/g, "")}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </div>

          <div className="flex items-center gap-2 p-2 bg-purple-600 text-white">
            <Button className="bg-purple-700 hover:bg-purple-800 text-white text-xs h-8">
              Run query <span className="ml-1 text-xs opacity-70">⌘ Enter</span>
            </Button>
            <Button
              variant="outline"
              className="border-purple-400 text-white hover:bg-purple-700 text-xs h-8"
            >
              Reference cell
            </Button>
            <Button
              variant="outline"
              className="border-purple-400 text-white hover:bg-purple-700 text-xs h-8"
            >
              AI Assist
            </Button>
            <Button
              variant="outline"
              className="border-purple-400 text-white hover:bg-purple-700 text-xs h-8"
            >
              Save query
            </Button>
          </div>

          <div className="p-2 bg-white border-b">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm">5,240 rows completed in 8s</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <SalesTable />
          </div>
        </div>
      </div>

      {/* Use the extracted QueryHistoryPanel component */}
      <QueryHistoryPanel
        isOpen={isHistoryOpen}
        onClose={toggleHistory}
        queryHistory={queryHistory}
        onSelectQuery={handleSelectQuery}
      />
    </div>
  );
}
