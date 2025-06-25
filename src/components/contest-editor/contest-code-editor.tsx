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
import { SalesTable } from "@/components/editor/sales-table";
import { ContestQueryHistoryPanel } from "./contest-query-history-panel";

interface ContestCodeEditorProps {
  question?: QuestionDetail | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  contestId: string;
  outerQuestionId: string;
}

interface QueryResult {
  status: number;
  result: any[] | string;
  typeQuery: string;
  timeExec: number;
  testPass: number;
  totalTest: number;
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

  // States
  const [sqlQuery, setSqlQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const [availableDatabases, setAvailableDatabases] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);

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

  // Load available databases when question changes
  useEffect(() => {
    if (question?.questionDetails) {
      const databases = question.questionDetails.map((detail) => ({
        id: detail.typeDatabase.id,
        name: detail.typeDatabase.name,
      }));
      setAvailableDatabases(databases);

      // Auto-select first database
      if (databases.length > 0 && !selectedDatabase) {
        setSelectedDatabase(databases[0].name);
      }
    }
  }, [question, selectedDatabase]);

  // Load prefix code when question changes
  useEffect(() => {
    if (question?.prefixCode) {
      setSqlQuery(question.prefixCode);
    }
  }, [question]);

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
  };

  const handleSelectQuery = (sql: string) => {
    setSqlQuery(sql);
    setIsHistoryOpen(false);
    toastSuccess("Đã load query từ history");
  };

  // Run SQL query
  const runQuery = async () => {
    if (!question) {
      toastError("Chưa có đề bài", {
        description: "Vui lòng tải lại trang để lấy đề bài",
      });
      return;
    }

    if (!sqlQuery.trim()) {
      toastWarning("Vui lòng nhập SQL query");
      return;
    }

    if (!selectedDatabase) {
      toastWarning("Vui lòng chọn loại database");
      return;
    }

    const selectedDbDetail = availableDatabases.find(
      (db) => db.name === selectedDatabase
    );
    if (!selectedDbDetail) {
      toastError("Database không hợp lệ");
      return;
    }

    try {
      setIsRunning(true);
      setQueryResult(null);

      const payload = {
        questionId: question.id,
        sql: sqlQuery,
        typeDatabaseId: selectedDbDetail.id,
      };

      const result: QueryResult = await api.question.executeSql(payload);
      setQueryResult(result);

      if (result.status === 200) {
        toastSuccess("Query thực thi thành công!", {
          description: `${result.timeExec}ms • ${result.typeQuery}`,
        });
      } else {
        toastError("Query có lỗi", {
          description:
            typeof result.result === "string" ? result.result : "Có lỗi xảy ra",
        });
      }
    } catch (error: any) {
      toastError("Lỗi khi thực thi query", {
        description: api.utils.formatErrorMessage(error),
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Upload file
  const handleFileUpload = async (file: File) => {
    if (!question) {
      toastError("Chưa có đề bài");
      return;
    }

    if (!selectedDatabase) {
      toastWarning("Vui lòng chọn loại database trước khi upload file");
      return;
    }

    try {
      setIsUploading(true);

      const fileContent = await file.text();
      setSqlQuery(fileContent);

      toastSuccess("File đã được upload thành công!", {
        description: `File ${file.name} đã được load vào editor`,
      });
    } catch (error: any) {
      toastError("Lỗi khi upload file", {
        description: api.utils.formatErrorMessage(error),
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUploadClick = () => {
    if (!question) {
      toastError("Chưa có đề bài");
      return;
    }

    if (!selectedDatabase) {
      toastWarning("Vui lòng chọn loại database trước khi upload file");
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Submit solution
  const submitSolution = async () => {
    if (!question) {
      toastError("Chưa có đề bài");
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

    const selectedDbDetail = availableDatabases.find(
      (db) => db.name === selectedDatabase
    );
    if (!selectedDbDetail) {
      toastError("Database không hợp lệ");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        questionId: question.id,
        sql: sqlQuery,
        typeDatabaseId: selectedDbDetail.id,
      };

      await submitToAPI(payload, {
        databaseName: selectedDatabase,
        questionCode: question.questionCode,
        questionTitle: question.title,
      });

      toastInfo("Đã nộp bài thành công!", {
        description: "Kết quả sẽ được cập nhật qua WebSocket",
      });
    } catch (error: any) {
      toastError("Lỗi khi nộp bài", {
        description: api.utils.formatErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "EASY":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
      case "HARD":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
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
      <div className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Contest Editor</h2>
            {question && (
              <>
                <span className="text-sm text-muted-foreground">
                  #{question.questionCode}
                </span>
                <Badge className={getLevelColor(question.level)}>
                  {question.level}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {question.point} điểm
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleHistory}
              disabled={historyLoading}
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Controls */}
        <div className="flex-shrink-0 border-b p-3">
          <div className="flex items-center gap-3">
            {/* Database Selection */}
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <Select
                value={selectedDatabase}
                onValueChange={setSelectedDatabase}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Chọn DB" />
                </SelectTrigger>
                <SelectContent>
                  {availableDatabases.map((db) => (
                    <SelectItem key={db.id} value={db.name}>
                      {db.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                disabled={isUploading || !question}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={runQuery}
                disabled={isRunning || !question}
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run
              </Button>

              <Button
                size="sm"
                onClick={submitSolution}
                disabled={isSubmitting || !question}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Submit
              </Button>
            </div>
          </div>
        </div>

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
        <div className="flex-1 overflow-hidden">
          <Card className="h-full m-3 mt-0">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-medium">Kết quả</h3>
              </div>

              <div className="flex-1 overflow-auto">
                {queryResult ? (
                  queryResult.status === 200 ? (
                    <div>
                      <div className="p-4 pb-0">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                              Query executed successfully
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Array.isArray(queryResult.result)
                              ? queryResult.result.length
                              : 0}{" "}
                            rows • {queryResult.timeExec}ms •{" "}
                            {queryResult.typeQuery}
                          </span>
                        </div>
                      </div>
                      {Array.isArray(queryResult.result) && (
                        <SalesTable data={queryResult.result} />
                      )}
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                          Query failed
                        </span>
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400 font-mono">
                        {typeof queryResult.result === "string"
                          ? queryResult.result
                          : "Unknown error"}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="p-8 text-center">
                    <Timer className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Chạy query để xem kết quả
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
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
