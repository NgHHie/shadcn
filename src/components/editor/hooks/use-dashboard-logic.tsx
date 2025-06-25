// src/components/editor/hooks/use-dashboard-logic.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { QuestionDetail, useApi } from "@/lib/api";
import { toastSuccess, toastError, toastWarning, toastInfo } from "@/lib/toast";

interface UseDashboardLogicProps {
  question: QuestionDetail | null | undefined;
  api: ReturnType<typeof useApi>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  submitToAPI: (payload: any, additionalInfo?: any) => Promise<void>;
  isMobile: boolean;
}

interface QueryResult {
  status: number;
  result: any[] | string;
  typeQuery: string;
  timeExec: number;
  testPass?: number;
  totalTest?: number;
}

export function useDashboardLogic({
  question,
  api,
  fileInputRef,
  submitToAPI,
  isMobile,
}: UseDashboardLogicProps) {
  // State management
  const [sqlQuery, setSqlQuery] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editorHeight, setEditorHeight] = useState(isMobile ? 150 : 200);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Set initial database from question if available
  useEffect(() => {
    if (question?.questionDetails?.[0]?.typeDatabase) {
      if (!selectedDatabase) {
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
  const handleRunQuery = useCallback(async () => {
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

      // Check if result has correct structure
      if (result && typeof result === "object") {
        setQueryResult(result);

        if (result.status === 1 || result.status === 200) {
          toastSuccess("Query thực thi thành công!", {
            description: `${result.timeExec || 0}ms • ${
              result.typeQuery || "SQL"
            }`,
          });
        } else {
          toastError("Query có lỗi", {
            description:
              typeof result.result === "string"
                ? result.result
                : "Có lỗi xảy ra",
          });
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      const errorMessage = api.utils.formatErrorMessage(error);
      setQueryError(errorMessage);
      toastError("Lỗi khi thực thi query", {
        description: errorMessage,
      });
    } finally {
      setIsRunning(false);
    }
  }, [question, sqlQuery, selectedDatabase, availableDatabases, api]);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
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

        // Update SQL editor with file content
        setSqlQuery(fileContent);

        toastSuccess("Upload file thành công!", {
          description: `File ${file.name} đã được load vào editor`,
          duration: 3000,
        });
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
    },
    [question, selectedDatabase, api, fileInputRef]
  );

  // Handle upload button click
  const handleUploadClick = useCallback(() => {
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
  }, [question, selectedDatabase, fileInputRef]);

  // Handle file input change
  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  // Submit solution to API
  const submitSolution = useCallback(async () => {
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
  }, [
    question,
    sqlQuery,
    selectedDatabase,
    availableDatabases,
    api,
    submitToAPI,
  ]);

  return {
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
  };
}
