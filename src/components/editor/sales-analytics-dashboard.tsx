// src/components/editor/sales-analytics-dashboard.tsx
"use client";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { History, Upload, Terminal, Send, Loader2 } from "lucide-react";
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
import { toastError, toastWarning } from "@/lib/toast";
import { QuestionDetail, useApi } from "@/lib/api";
import { contestApi, FileSubmissionRequest } from "@/lib/apiContest";
import { useSubmissionHistory } from "@/hooks/use-submission-history";

import { SqlEditor } from "./sql-editor";

interface SalesAnalyticsDashboardProps {
  question?: QuestionDetail | null;
}

export function SalesAnalyticsDashboard({
  question,
}: SalesAnalyticsDashboardProps) {
  const { t } = useTranslation("editor");
  const isMobile = useIsMobile();
  const api = useApi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use submission history hook for WebSocket integration
  const { submissions, submitSolution: submitToAPI } = useSubmissionHistory(
    question?.id,
    {
      code: question?.questionCode || "",
      title: question?.title || "",
    }
  );

  const [sqlQuery, setSqlQuery] = useState(""); // Empty by default
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editorHeight, setEditorHeight] = useState(isMobile ? 150 : 200);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState(""); // Empty by default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  // Keyboard shortcut for Run Query (Ctrl + Enter)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        if (!isRunning && question && sqlQuery.trim() && selectedDatabase) {
          handleRunQuery();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isRunning, question, sqlQuery, selectedDatabase]);

  // Execute SQL query via API
  const handleRunQuery = async () => {
    if (!question) {
      toastError(t("sqlEditor.errors.noQuestionRun"));
      return;
    }

    if (!sqlQuery.trim()) {
      toastWarning("sqlEditor.errors.emptyQuery");
      return;
    }

    if (!selectedDatabase) {
      toastWarning("sqlEditor.errors.noDatabase");
      return;
    }

    // Find the selected database ID
    const selectedDbDetail = availableDatabases.find(
      (db) => db.name === selectedDatabase
    );
    if (!selectedDbDetail) {
      toastError("sqlEditor.errors.invalidDatabase");
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

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!question) {
      toastError("Chưa có đề bài", {
        description: "Vui lòng chọn một câu hỏi để upload file",
      });
      return;
    }

    if (!selectedDatabase) {
      toastWarning("Vui lòng chọn loại database trước khi upload file");
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".sql")) {
      toastError("File không hợp lệ", {
        description: "Chỉ chấp nhận file có đuôi .sql",
      });
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      toastError("File quá lớn", {
        description: "Kích thước file không được vượt quá 1MB",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Read file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      // Find the selected database ID
      const selectedDbDetail = availableDatabases.find(
        (db) => db.name === selectedDatabase
      );
      if (!selectedDbDetail) {
        toastError("Database không hợp lệ");
        return;
      }

      const payload: FileSubmissionRequest = {
        questionId: question.id,
        typeDatabaseId: selectedDbDetail.id,
        isSubmitContest: false,
        questionContestId: "",
        file,
      };
      // Call API
      const response = await contestApi.submitFile(payload);
      // Update SQL editor with file content
      setSqlQuery(fileContent);
    } catch (error: any) {
      console.error("Upload error:", error);
      toastError("Lỗi khi upload file", {
        description: api.utils.formatErrorMessage(error),
        duration: 6000,
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle upload button click
  const handleUploadClick = () => {
    if (!question) {
      toastError("Chưa có đề bài", {
        description: "Vui lòng chọn một câu hỏi để upload file",
      });
      return;
    }

    if (!selectedDatabase) {
      toastWarning("Vui lòng chọn loại database trước khi upload file");
      return;
    }

    fileInputRef.current?.click();
  };

  // Handle file input change
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Submit solution to API
  const submitSolution = async () => {
    if (!question) {
      toastError(t("sqlEditor.erors"), {
        description: t("sqlEditor.noQuestionSubmit"),
      });
      return;
    }

    if (!sqlQuery.trim()) {
      toastWarning(t("sqlEditor.emptyQuerySubmit"));
      return;
    }

    if (!selectedDatabase) {
      toastWarning(t("sqlEditor.noDatabase"));
      return;
    }

    // Find the selected database ID
    const selectedDbDetail = availableDatabases.find(
      (db) => db.name === selectedDatabase
    );
    if (!selectedDbDetail) {
      toastError(t("sqlEditor.invalidDatabase"));
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        questionId: question.id,
        sql: sqlQuery,
        typeDatabaseId: selectedDbDetail.id,
      };

      // Use the WebSocket-integrated submit function
      await submitToAPI(payload, {
        databaseName: selectedDatabase,
        questionCode: question.questionCode,
        questionTitle: question.title,
      });

      setTimeout(() => {
        setIsHistoryOpen(true);
      }, 500);

      // The result will be updated via WebSocket in real-time
    } catch (error: any) {
      toastError(t("sqlEditor.submitFailed"), {
        description: api.utils.formatErrorMessage(error),
        duration: 6000,
        action: {
          label: t("assignment.retry"),
          onClick: () => submitSolution(),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveQuery = () => {
    toastWarning(t("sqlEditor.errors.saveFailed"));
    return;
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
  };

  // Convert submissions to QueryHistoryItem format for compatibility
  const queryHistoryData: QueryHistoryItem[] = useMemo(() => {
    // If no question selected, return empty array
    if (!question) {
      return [];
    }

    // If question exists but no submissions (Not Started), return empty array
    if (!submissions) {
      return [];
    }

    // Convert submissions to QueryHistoryItem format
    return submissions.map((submission, index) => ({
      id: index + 1,
      time: new Date(submission.timeSubmit).toLocaleString("vi-VN"),
      status: submission.status,
      duration: `${submission.timeout}ms`,
      result: `${submission.testPass}/${submission.totalTest}`,
      dbType: submission.database.name,
      sqlCode: submission.querySub,
    }));
  }, [submissions, question]);

  const handleSelectQuery = (query: QueryHistoryItem) => {
    console.log("Selected query:", query);
    setIsHistoryOpen(false);
  };

  return (
    <div
      className={`flex flex-col w-full bg-background ${
        isMobile ? "min-h-screen" : "h-full overflow-hidden"
      }`}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".sql"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

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
            {t("sqlEditor.title")}
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
                  {t("sqlEditor.noDatabase")}
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 ${isMobile ? "text-xs h-7" : ""}`}
            onClick={handleUploadClick}
            disabled={isUploading || !question || !selectedDatabase}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span
              className={`${isMobile ? "text-xs" : "text-sm"} ${
                isMobile ? "" : "hidden sm:inline"
              }`}
            >
              {isUploading
                ? t("sqlEditor.uploading")
                : isMobile
                ? t("sqlEditor.uploadShort")
                : t("sqlEditor.uploadFile")}
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
              {t("sqlEditor.history")}
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
              initialValue={sqlQuery}
              onChange={setSqlQuery}
              database={selectedDatabase}
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
                {isSubmitting
                  ? t("sqlEditor.submitting")
                  : t("sqlEditor.submit")}
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
                    {t("sqlEditor.running")}
                  </>
                ) : (
                  <span className="transition-opacity duration-200 ease-in-out">
                    {isHovering && !isMobile
                      ? "Ctrl + Enter"
                      : t("sqlEditor.runQuery")}
                  </span>
                )}
              </Button>

              {/* <Button
                variant="outline"
                className={`border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 whitespace-nowrap flex-shrink-0 transition-all duration-200 hover:border-primary/50 font-medium ${
                  isMobile ? "text-xs h-7" : "text-xs h-8"
                }`}
                onClick={handleSaveQuery}
              >
                {t("sqlEditor.saveQuery")}
              </Button> */}
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
                            {t("sqlEditor.success.queryExecuted")}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {queryResult.result.length}{" "}
                          {t("sqlEditor.results.rows")} • {queryResult.timeExec}
                          ms • {queryResult.typeQuery}
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
