// src/components/editor/sales-analytics-dashboard.tsx
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
  Send,
  Loader2,
} from "lucide-react";
import { SalesTable } from "@/components/editor/sales-table";
import { QueryHistoryPanel } from "@/components/editor/query-history-panel";
import { Card } from "@/components/ui/card";
import { QueryHistoryItem } from "@/types/sales";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
  toastLoading,
  toastPromise,
  dismissToast,
} from "@/lib/toast";
import { QuestionDetail, useApi, SubmissionRequest } from "@/lib/api";

// Import dữ liệu lịch sử truy vấn với kiểu đúng
import queryHistoryDataJson from "./data/query-history-mock-data.json";
import { SqlEditor } from "./sql-editor";
const queryHistoryData: QueryHistoryItem[] =
  queryHistoryDataJson as QueryHistoryItem[];

interface SalesAnalyticsDashboardProps {
  question?: QuestionDetail | null;
}

export function SalesAnalyticsDashboard({
  question,
}: SalesAnalyticsDashboardProps) {
  const isMobile = useIsMobile();
  const api = useApi();

  const [sqlQuery, setSqlQuery] = useState(""); // Empty by default
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editorHeight, setEditorHeight] = useState(isMobile ? 150 : 200);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState(""); // Empty by default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const minEditorHeight = isMobile ? 100 : 50;
  const maxEditorHeight = isMobile ? 300 : 800;

  // Set initial database from question if available
  useEffect(() => {
    if (question?.questionDetails?.[0]?.typeDatabase) {
      if (!selectedDatabase) {
        // Only set if not already selected
        setSelectedDatabase(question.questionDetails[0].typeDatabase.name);
      }
    }
  }, [question, selectedDatabase]);

  // Get available databases from question
  const availableDatabases = useMemo(() => {
    if (!question?.questionDetails) return [];

    return question.questionDetails.map((detail) => ({
      id: detail.typeDatabase.id,
      name: detail.typeDatabase.name,
    }));
  }, [question?.questionDetails]);

  // Mock function to simulate SQL execution
  const executeQuery = async (query: string) => {
    // Simulate API call delay
    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 2000)
    );

    // Simulate success/failure randomly
    if (Math.random() > 0.3) {
      return {
        success: true,
        rows: Math.floor(Math.random() * 10000) + 100,
        duration: (Math.random() * 0.1 + 0.01).toFixed(3) + "s",
        data: [],
      };
    } else {
      throw new Error("Syntax error: Invalid column name 'invalid_column'");
    }
  };

  // Execute SQL query via API
  const handleRunQuery = async () => {
    if (!question) {
      toastError("Chưa có đề bài để chạy query");
      return;
    }

    if (!sqlQuery.trim()) {
      toastWarning("Vui lòng nhập SQL query trước khi chạy");
      return;
    }

    if (!selectedDatabase) {
      toastWarning("Vui lòng chọn loại database");
      return;
    }

    // Find the selected database ID
    const selectedDbDetail = availableDatabases.find(
      (db) => db.name === selectedDatabase
    );
    if (!selectedDbDetail) {
      toastError("Database không hợp lệ");
      return;
    }

    try {
      setIsRunning(true);
      setQueryError(null);
      setQueryResult(null);

      const payload = {
        questionId: question.id,
        sql: sqlQuery,
        typeDatabaseId: selectedDbDetail.id,
      };

      const result = await api.question.executeSql(payload);

      if (result.status === 1) {
        // Success
        setQueryResult(result);
      } else {
        // Error
        setQueryError(
          typeof result.result === "string" ? result.result : "Unknown error"
        );
      }
    } catch (error: any) {
      const errorMessage = api.utils.formatErrorMessage(error);
      setQueryError(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit solution to API
  const submitSolution = async () => {
    if (!question) {
      toastError("Chưa có đề bài", {
        description: "Vui lòng chọn một câu hỏi để nộp bài",
      });
      return;
    }

    if (!sqlQuery.trim()) {
      toastWarning("Vui lòng nhập SQL query trước khi nộp bài");
      return;
    }

    if (!selectedDatabase) {
      toastWarning("Vui lòng chọn loại database");
      return;
    }

    // Find the selected database ID
    const selectedDbDetail = availableDatabases.find(
      (db) => db.name === selectedDatabase
    );
    if (!selectedDbDetail) {
      toastError("Database không hợp lệ");
      return;
    }

    try {
      setIsSubmitting(true);

      const submissionData: SubmissionRequest = {
        questionId: question.id,
        sqlCode: sqlQuery,
        typeDatabase: selectedDbDetail.id,
      };

      const result = await api.question.submitSolution(submissionData);

      if (result.status === "ACCEPTED") {
        toastSuccess("🎉 Accepted! Chúc mừng bạn đã giải đúng!", {
          description: `Thời gian thực thi: ${result.executionTime}ms | Rows: ${result.resultRows}`,
          action: {
            label: "Xem chi tiết",
            onClick: () =>
              toastInfo("Kết quả chi tiết", {
                description: `ID: ${result.id} | Tạo lúc: ${new Date(
                  result.createdAt
                ).toLocaleString()}`,
              }),
          },
        });
      } else if (result.status === "WRONG_ANSWER") {
        toastError("❌ Wrong Answer", {
          description: result.errorMessage || "Kết quả không đúng với mong đợi",
          duration: 8000,
        });
      } else if (result.status === "TIME_LIMIT_EXCEEDED") {
        toastError("⏰ Time Limit Exceeded", {
          description: "Query chạy quá lâu, vui lòng tối ưu lại",
          duration: 6000,
        });
      } else {
        toastError("💥 Runtime Error", {
          description: result.errorMessage || "Có lỗi xảy ra khi thực thi",
          duration: 8000,
        });
      }
    } catch (error: any) {
      toastError("Lỗi khi nộp bài", {
        description: api.utils.formatErrorMessage(error),
        duration: 6000,
        action: {
          label: "Thử lại",
          onClick: () => submitSolution(),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveQuery = () => {
    toastWarning("Chưa có chức năng này.");
    return;
  };

  const handleUploadFile = () => {
    toastInfo("Tính năng upload file", {
      description: "Chọn file SQL để import vào editor",
      action: {
        label: "Chọn file",
        onClick: () => {
          // Simulate file upload
          setTimeout(() => {
            if (Math.random() > 0.5) {
              toastSuccess("File đã được upload thành công!");
            } else {
              toastError("Lỗi upload file", {
                description: "File không đúng định dạng hoặc quá lớn",
              });
            }
          }, 1000);
        },
      },
    });
  };

  const handleSelectDatabase = () => {
    // This will be handled by the Select component now
  };

  // Existing drag handling code...
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
      const newHeight = e.clientY - containerTop - 32;

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

  useEffect(() => {
    if (isMobile && editorHeight > 300) {
      setEditorHeight(150);
    } else if (!isMobile && editorHeight < 150) {
      setEditorHeight(200);
    }
  }, [isMobile]);

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
    if (!isHistoryOpen) {
      toastInfo("Mở lịch sử query", {
        description: "Xem các query đã thực thi trước đó",
      });
    }
  };

  const handleSelectQuery = (query: QueryHistoryItem) => {
    console.log("Selected query:", query);
    setIsHistoryOpen(false);
    toastSuccess("Đã tải query từ lịch sử", {
      description: `Query từ ${query.time}`,
    });
  };

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

        <div
          className={`flex items-center gap-2 ${
            isMobile ? "flex-wrap w-full mt-2" : "ml-4"
          }`}
        >
          <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
            <SelectTrigger
              className={`gap-1 whitespace-nowrap flex-shrink-0 ${
                isMobile ? "text-xs h-7 w-[140px]" : "w-[160px]"
              }`}
            >
              <SelectValue placeholder="Chọn database" />
            </SelectTrigger>
            <SelectContent>
              {availableDatabases.length > 0 ? (
                availableDatabases.map((db) => (
                  <SelectItem key={db.id} value={db.name}>
                    {db.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="default" disabled>
                  Chưa có database
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 ${isMobile ? "text-xs h-7" : ""}`}
            onClick={handleUploadFile}
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
            <SqlEditor
              height={`${editorHeight}px`}
              initialValue="" // Empty by default
              onChange={setSqlQuery}
              database={selectedDatabase} // Pass selected database for syntax highlighting
            />

            {/* Resizable divider */}
            <div
              className={`relative h-3 bg-muted hover:bg-primary/20 cursor-row-resize z-10 ${
                isDragging ? "bg-primary/30" : ""
              } transition-colors flex-shrink-0`}
              onMouseDown={startDragging}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-0.5 w-8 bg-muted-foreground/50 rounded-full"></div>
              </div>
            </div>

            {/* Action buttons with toast notifications */}
            <div
              className={`flex items-center gap-3 p-2 flex-shrink-0 bg-background border-b ${
                isMobile ? "flex-wrap gap-2" : "overflow-x-auto"
              }`}
            >
              <Button
                className={`bg-green-600 text-white font-medium whitespace-nowrap flex-shrink-0 hover:bg-green-700 shadow-sm transition-all duration-200 hover:shadow transform hover:-translate-y-0.5 ${
                  isMobile ? "text-xs h-7" : "text-xs h-8"
                }`}
                onClick={submitSolution}
                disabled={isSubmitting || !question}
              >
                <Send className="h-3 w-3 mr-1" />
                {isSubmitting ? "Đang nộp..." : "Submit"}
              </Button>

              <Button
                variant="outline"
                className={`border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 whitespace-nowrap flex-shrink-0 transition-all duration-200 hover:border-primary/50 font-medium ${
                  isMobile ? "text-xs h-7" : "text-xs h-8"
                }`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={handleRunQuery}
                disabled={
                  isRunning ||
                  !question ||
                  !sqlQuery.trim() ||
                  !selectedDatabase
                }
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Đang chạy...
                  </>
                ) : (
                  <span className="transition-opacity duration-200 ease-in-out">
                    {isHovering && !isMobile ? "Ctrl + Enter" : "Run query"}
                  </span>
                )}
              </Button>

              <Button
                variant="outline"
                className={`border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 whitespace-nowrap flex-shrink-0 transition-all duration-200 hover:border-primary/50 font-medium ${
                  isMobile ? "text-xs h-7" : "text-xs h-8"
                }`}
                onClick={handleSaveQuery}
              >
                Save query
              </Button>
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
                {queryError ? (
                  // Error display
                  <div className="p-4">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                            Error
                          </h4>
                          <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono">
                            {queryError}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : queryResult && Array.isArray(queryResult.result) ? (
                  // Success - show header info then use SalesTable with query data
                  <div>
                    <div className="p-4 pb-0">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            Query executed successfully
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {queryResult.result.length} rows •{" "}
                          {queryResult.timeExec}ms • {queryResult.typeQuery}
                        </span>
                      </div>
                    </div>
                    {/* Use SalesTable component but pass query result data */}
                    <SalesTable data={queryResult.result} />
                  </div>
                ) : (
                  // Default state - show mock sales table
                  <SalesTable />
                )}
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
