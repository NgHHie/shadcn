// src/components/contest-editor/hooks/use-contest-logic.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { QuestionDetail, useApi } from "@/lib/api";
import { toastSuccess, toastError, toastWarning, toastInfo } from "@/lib/toast";

interface UseContestLogicProps {
  question?: QuestionDetail | null;
  api: ReturnType<typeof useApi>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  submitToAPI: (payload: any, additionalInfo?: any) => Promise<void>;
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

export function useContestLogic({
  question,
  api,
  fileInputRef,
  submitToAPI,
  contestId,
  outerQuestionId,
}: UseContestLogicProps) {
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

  // Run SQL query - FIX: Đảm bảo kết quả được hiển thị
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
      setQueryResult(null); // Clear previous result

      const payload = {
        questionId: question.id,
        sql: sqlQuery,
        typeDatabaseId: selectedDbDetail.id,
      };

      console.log("Sending run query request:", payload); // Debug log

      const result: QueryResult = await api.question.executeSql(payload);

      console.log("Received query result:", result); // Debug log

      // FIX: Đảm bảo set queryResult với đúng format
      if (result) {
        setQueryResult({
          status: result.status || 200,
          result: result.result || [],
          typeQuery: result.typeQuery || "SELECT",
          timeExec: result.timeExec || 0,
          testPass: result.testPass || 0,
          totalTest: result.totalTest || 0,
        });

        if (result.status === 200 || result.status === 1) {
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
        toastError("Không nhận được kết quả từ server");
      }
    } catch (error: any) {
      console.error("Query execution error:", error); // Debug log
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

  return {
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
  };
}
