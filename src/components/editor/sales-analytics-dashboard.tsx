// src/components/editor/sales-analytics-dashboard.tsx
"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
import { toastSuccess, toastError, toastWarning, toastInfo } from "@/lib/toast";
import { QuestionDetail, useApi } from "@/lib/api";
import { useSubmissionHistory } from "@/hooks/use-submission-history";

import { SqlEditor } from "./sql-editor";
import { DashboardHeader } from "./dashboard-header";
import { DashboardControls } from "./dashboard-controls";
import { ResultsPanel } from "./results-panel";
import { useDashboardLogic } from "./hooks/use-dashboard-logic";

interface SalesAnalyticsDashboardProps {
  question?: QuestionDetail | null;
}

export function SalesAnalyticsDashboard({
  question,
}: SalesAnalyticsDashboardProps) {
  const isMobile = useIsMobile();
  const api = useApi();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpenHistory = useCallback(() => {
    setIsHistoryOpen(true);
  }, []);

  // Use submission history hook for WebSocket integration
  const { submissions, submitSolution: submitToAPI } = useSubmissionHistory(
    question?.id,
    {
      code: question?.questionCode || "",
      title: question?.title || "",
    },
    handleOpenHistory
  );

  // Use custom hook for dashboard logic
  const {
    sqlQuery,
    setSqlQuery,
    isHistoryOpen,
    setIsHistoryOpen,
    editorHeight,
    setEditorHeight,
    isDragging,
    setIsDragging,
    isHovering,
    setIsHovering,
    selectedDatabase,
    setSelectedDatabase,
    isSubmitting,
    setIsSubmitting,
    isRunning,
    setIsRunning,
    isUploading,
    setIsUploading,
    queryResult,
    setQueryResult,
    queryError,
    setQueryError,
    availableDatabases,
    handleRunQuery,
    handleFileUpload,
    handleUploadClick,
    handleFileInputChange,
    submitSolution,
  } = useDashboardLogic({
    question,
    api,
    fileInputRef,
    submitToAPI,
    isMobile,
  });

  const minEditorHeight = isMobile ? 100 : 50;
  const maxEditorHeight = isMobile ? 300 : 800;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-background transition-all duration-200 ${
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

      {/* Header */}
      <DashboardHeader
        isMobile={isMobile}
        selectedDatabase={selectedDatabase}
        setSelectedDatabase={setSelectedDatabase}
        availableDatabases={availableDatabases}
        question={question}
        isUploading={isUploading}
        handleUploadClick={handleUploadClick}
        isHistoryOpen={isHistoryOpen}
        setIsHistoryOpen={setIsHistoryOpen}
      />

      {/* Controls */}
      <DashboardControls
        isMobile={isMobile}
        isRunning={isRunning}
        handleRunQuery={handleRunQuery}
        isSubmitting={isSubmitting}
        submitSolution={submitSolution}
        question={question}
        sqlQuery={sqlQuery}
        selectedDatabase={selectedDatabase}
      />

      {/* SQL Editor */}
      <div
        className="flex-shrink-0"
        style={{
          height: `${editorHeight}px`,
          minHeight: `${minEditorHeight}px`,
          maxHeight: `${maxEditorHeight}px`,
        }}
      >
        <SqlEditor
          value={sqlQuery}
          onChange={setSqlQuery}
          disabled={!question}
          placeholder="-- Nhập SQL query của bạn ở đây
-- Sử dụng Ctrl + Enter để chạy query"
        />
      </div>

      {/* Resize Handle */}
      <div
        className={`relative h-2 bg-muted cursor-row-resize flex-shrink-0 hover:bg-muted/80 transition-colors group ${
          isDragging ? "bg-primary/20" : ""
        } ${isHovering ? "bg-muted/60" : ""}`}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-1 bg-muted-foreground/30 rounded-full group-hover:bg-muted-foreground/50 transition-colors" />
        </div>
      </div>

      {/* Results Panel */}
      <ResultsPanel
        queryResult={queryResult}
        queryError={queryError}
        isRunning={isRunning}
      />

      {/* Query History Panel */}
      <QueryHistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        queryHistory={submissions.map((sub) => ({
          id: sub.id,
          time: sub.createdAt,
          status: sub.status,
          duration: `${sub.timeout}ms`,
          result: sub.status === "AC" ? "Success" : sub.status,
          dbType: sub.database?.name || "Unknown",
          sqlCode: sub.sql || "",
        }))}
        onSelectQuery={(sql) => {
          setSqlQuery(sql);
          setIsHistoryOpen(false);
          toastSuccess("Đã load query từ history");
        }}
      />
    </div>
  );
}
