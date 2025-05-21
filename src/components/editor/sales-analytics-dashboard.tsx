// src/components/editor/sales-analytics-dashboard.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Database,
  DollarSign,
  History,
  Percent,
  Upload,
  Terminal,
  Type,
} from "lucide-react";
import { SalesTable } from "@/components/editor/sales-table";
import { QueryHistoryPanel } from "@/components/editor/query-history-panel";
import { Card } from "@/components/ui/card";
import { QueryHistoryItem } from "@/types/sales";
import { useIsMobile } from "@/hooks/use-mobile";

// Import dữ liệu lịch sử truy vấn với kiểu đúng
import queryHistoryDataJson from "./data/query-history-mock-data.json";
import { SqlEditor } from "./sql-editor";
const queryHistoryData: QueryHistoryItem[] =
  queryHistoryDataJson as QueryHistoryItem[];

export function SalesAnalyticsDashboard() {
  const isMobile = useIsMobile();
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
  const [editorHeight, setEditorHeight] = useState(isMobile ? 150 : 200); // Smaller on mobile
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const minEditorHeight = isMobile ? 100 : 50;
  const maxEditorHeight = isMobile ? 300 : 800;

  // Xử lý kéo đổi kích thước
  const startDragging = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerTop = containerRect.top;
      const newHeight = e.clientY - containerTop - 32; // 32px for header

      if (newHeight >= minEditorHeight && newHeight <= maxEditorHeight) {
        setEditorHeight(newHeight);
      }
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", stopDragging);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [isDragging]);

  // Update editor height when switching between mobile/desktop
  useEffect(() => {
    if (isMobile && editorHeight > 300) {
      setEditorHeight(150);
    } else if (!isMobile && editorHeight < 150) {
      setEditorHeight(200);
    }
  }, [isMobile]);

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  const handleSelectQuery = (query: QueryHistoryItem) => {
    console.log("Selected query:", query);
    setIsHistoryOpen(false);
  };

  // Handle editor input and syntax highlighting
  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSqlQuery(e.target.value);
  };

  // Auto-focus khi component được render
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  return (
    <div
      className={`flex flex-col w-full bg-background ${
        isMobile ? "min-h-screen" : "h-full overflow-hidden"
      }`}
    >
      {/* Header - responsive */}
      <div
        className={`flex items-center gap-2 border-b p-2 bg-muted/30 flex-shrink-0 ${
          isMobile ? "flex-wrap" : "overflow-x-auto"
        }`}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full bg-primary/10 text-primary flex-shrink-0 border-primary/20"
          >
            <Terminal className="h-4 w-4" />
          </Button>
          <span
            className={`font-medium whitespace-nowrap text-foreground ${
              isMobile ? "text-xs" : "text-sm"
            }`}
          >
            SQL Editor
          </span>
        </div>

        {/* Mobile: Stack buttons vertically when needed */}
        <div
          className={`flex items-center gap-2 ${
            isMobile ? "flex-wrap w-full mt-2" : "ml-4"
          }`}
        >
          <Button
            variant="outline"
            size="sm"
            className={`gap-1 whitespace-nowrap flex-shrink-0 ${
              isMobile ? "text-xs h-7" : ""
            }`}
          >
            <span className={isMobile ? "text-xs" : "text-sm"}>
              {isMobile ? "Database" : "Select database type"}
            </span>
            <ChevronDown className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 ${isMobile ? "text-xs h-7" : ""}`}
          >
            <Upload className="h-4 w-4" />
            <span
              className={`${isMobile ? "text-xs" : "text-sm"} ${
                isMobile ? "" : "hidden sm:inline"
              }`}
            >
              {isMobile ? "Upload" : "Upload file"}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 ${isMobile ? "text-xs h-7" : ""}`}
            onClick={toggleHistory}
          >
            <History className="h-4 w-4" />
            <span
              className={`${isMobile ? "text-xs" : "text-sm"} ${
                isMobile ? "" : "hidden sm:inline"
              }`}
            >
              History
            </span>
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`flex flex-col flex-1 min-w-0 p-2 ${
          isMobile ? "" : "overflow-hidden"
        }`}
      >
        <Card
          className={`flex flex-col flex-1 min-w-0 shadow-sm border ${
            isMobile ? "" : "overflow-hidden"
          }`}
        >
          <div
            className={`flex flex-col flex-1 min-w-0 ${
              isMobile ? "" : "overflow-hidden"
            }`}
          >
            {/* SQL Editor with resizable height */}
            <SqlEditor height={`${editorHeight}px`} />

            {/* Resizable divider - only show if not mobile or allow mobile resize */}
            <div
              className={`relative h-3 bg-muted hover:bg-primary/20 cursor-row-resize z-10 ${
                isDragging ? "bg-primary/30" : ""
              } transition-colors flex-shrink-0`}
              onMouseDown={startDragging}
            >
              {/* Drag handle indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-0.5 w-8 bg-muted-foreground/50 rounded-full"></div>
              </div>
            </div>

            {/* Action buttons - responsive */}
            <div
              className={`flex items-center gap-3 p-2 flex-shrink-0 bg-background border-b ${
                isMobile ? "flex-wrap gap-2" : "overflow-x-auto"
              }`}
            >
              <Button
                className={`bg-primary text-primary-foreground font-medium whitespace-nowrap flex-shrink-0 hover:bg-primary/90 shadow-sm transition-all duration-200 hover:shadow transform hover:-translate-y-0.5 ${
                  isMobile ? "text-xs h-7" : "text-xs h-8"
                }`}
              >
                Submit
              </Button>

              <Button
                variant="outline"
                className={`border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 whitespace-nowrap flex-shrink-0 transition-all duration-200 hover:border-primary/50 font-medium ${
                  isMobile ? "text-xs h-7" : "text-xs h-8"
                }`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <span className="transition-opacity duration-200 ease-in-out">
                  {isHovering && !isMobile ? "Ctrl + Enter" : "Run query"}
                </span>
              </Button>

              <Button
                variant="outline"
                className={`border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 whitespace-nowrap flex-shrink-0 transition-all duration-200 hover:border-primary/50 font-medium ${
                  isMobile ? "text-xs h-7" : "text-xs h-8"
                }`}
              >
                Save query
              </Button>
            </div>

            {/* Status bar */}
            <div
              className={`p-2 bg-card border-b flex-shrink-0 ${
                isMobile ? "px-2 py-1" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0"></div>
                  <span
                    className={`text-muted-foreground font-medium ${
                      isMobile ? "text-xs" : "text-sm"
                    }`}
                  >
                    5,240 rows
                  </span>
                </div>
                <div className="h-4 w-px bg-muted-foreground/20"></div>
                <span
                  className={`text-muted-foreground ${
                    isMobile ? "text-xs" : "text-sm"
                  }`}
                >
                  0.05s
                </span>
              </div>
            </div>

            {/* Results table */}
            <div
              className={`flex-1 bg-card ${
                isMobile ? "min-h-96" : "overflow-auto min-w-0"
              }`}
            >
              <div
                className={`w-full ${
                  isMobile ? "" : "min-w-0 overflow-x-auto"
                }`}
              >
                <SalesTable />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Query History Panel */}
      <QueryHistoryPanel
        isOpen={isHistoryOpen}
        onClose={toggleHistory}
        queryHistory={queryHistoryData}
        onSelectQuery={handleSelectQuery}
      />
    </div>
  );
}
