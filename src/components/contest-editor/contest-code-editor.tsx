// src/components/contest-editor/contest-code-editor.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Upload,
  Send,
  History,
  Loader2,
  Database,
  Timer,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuestionDetail, useApi } from "@/lib/api";
import { useContestSubmissionHistory } from "@/hooks/use-contest-submission-history";
import { toastSuccess, toastError, toastWarning, toastInfo } from "@/lib/toast";

import { ContestQueryHistoryPanel } from "./contest-query-history-panel";
import { ContestHeader } from "./contest-header";
import { ContestControls } from "./contest-controls";
import { ContestResultsPanel } from "./contest-results-panel";
import { useContestLogic } from "./hooks/use-contest-logic";

interface ContestCodeEditorProps {
  question?: QuestionDetail | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  contestId: string;
  outerQuestionId: string;
}

export function ContestCodeEditor({
  question,
  loading,
  error,
  onRetry,
  contestId,
  outerQuestionId,
}: ContestCodeEditorProps) {
  const api = useApi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Contest submission history hook
  const {
    submissions: queryHistoryData,
    loading: historyLoading,
    submitToAPI,
  } = useContestSubmissionHistory(
    question?.id,
    {
      code: question?.questionCode || "",
      title: question?.title || "",
    },
    () => setIsHistoryOpen(true),
    contestId,
    outerQuestionId
  );

  // Use contest logic hook
  const {
    sqlQuery,
    setSqlQuery,
    selectedDatabase,
    setSelectedDatabase,
    availableDatabases,
    isRunning,
    isSubmitting,
    isUploading,
    isHistoryOpen,
    setIsHistoryOpen,
    queryResult,
    runQuery,
    submitSolution,
    handleFileUpload,
    handleUploadClick,
    handleFileInputChange,
  } = useContestLogic({
    question,
    api,
    fileInputRef,
    submitToAPI,
    contestId,
    outerQuestionId,
  });

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  const handleSelectQuery = (sql: string) => {
    setSqlQuery(sql);
    setIsHistoryOpen(false);
    toastSuccess("Đã load query từ history");
  };

  if (loading) {
    return (
      <div className="h-full p-4 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="ml-2"
              >
                Thử lại
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <ContestHeader
        question={question}
        toggleHistory={toggleHistory}
        historyLoading={historyLoading}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Controls */}
        <ContestControls
          selectedDatabase={selectedDatabase}
          setSelectedDatabase={setSelectedDatabase}
          availableDatabases={availableDatabases}
          handleUploadClick={handleUploadClick}
          isUploading={isUploading}
          question={question}
          runQuery={runQuery}
          isRunning={isRunning}
          submitSolution={submitSolution}
          isSubmitting={isSubmitting}
        />

        {/* SQL Editor */}
        <div className="flex-shrink-0 p-3">
          <Textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            placeholder="Nhập SQL query của bạn..."
            className="font-mono text-sm min-h-[120px] resize-none"
            disabled={!question}
          />
        </div>

        {/* Results */}
        <ContestResultsPanel queryResult={queryResult} />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".sql,.txt"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Query History Panel */}
      <ContestQueryHistoryPanel
        isOpen={isHistoryOpen}
        onClose={toggleHistory}
        queryHistory={queryHistoryData}
        onSelectQuery={handleSelectQuery}
      />
    </div>
  );
}
