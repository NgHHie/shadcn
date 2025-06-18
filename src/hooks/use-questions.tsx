import { useState, useEffect, useCallback, useRef } from "react";
import { QuestionListItem, useApi, QuestionCompletionStatus } from "@/lib/api";
import { toastError } from "@/lib/toast";
import { handleDataFetchError } from "@/lib/error-handler";

export const useQuestions = (params?: {
  page?: number;
  size?: number;
  keyword?: string; // Đổi từ search thành keyword để match với API Spring
}) => {
  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(params?.page || 0);

  const api = useApi();
  const userInfoRef = useRef<{id: string} | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch questions list với keyword parameter
      const response = await api.question.getQuestions({
        page: params?.page,
        size: params?.size,
        keyword: params?.keyword, // Dùng keyword thay vì search
      });

      // Get user info to get userId (only once and cache it)
      if (!userInfoRef.current) {
        try {
          const userInfo = await api.user.getUserInfo();
          userInfoRef.current = { id: userInfo.id };
        } catch (userError) {
          console.warn("Could not get user info, will use default status");
        }
      }

      let questionsWithStatus = response.content.map((question) => ({
        ...question,
        status: "Not Started" as "AC" | "WA" | "TLE" | "CE" | "Not Started",
      }));

      // If we have user info, check completion status
      if (userInfoRef.current && response.content.length > 0) {
        try {
          const questionIds = response.content.map((q) => q.id);
          const completionStatuses = await api.question.checkCompletionStatus({
            questionIds,
            userId: userInfoRef.current.id,
          });

          // Create a map for quick lookup
          const statusMap = new Map<string, QuestionCompletionStatus>();
          completionStatuses.forEach((status) => {
            statusMap.set(status.questionId, status);
          });

          // Update questions with their actual status
          questionsWithStatus = response.content.map((question) => {
            const completionStatus = statusMap.get(question.id);
            return {
              ...question,
              status: completionStatus?.status || "Not Started",
            };
          });
        } catch (statusError) {
          console.warn("Could not fetch completion status:", statusError);
          // Continue with default "Not Started" status
        }
      }

      setQuestions(questionsWithStatus);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setCurrentPage(response.number);
    } catch (err: unknown) {
      console.error("Error fetching questions:", err);

      // Type guard for error with status
      const isErrorWithStatus = (error: unknown): error is { 
        response?: { status?: number }; 
        status?: number; 
        code?: number 
      } => {
        return typeof error === 'object' && error !== null;
      };

      // Handle specific error cases
      let errorStatus: number | undefined;
      if (isErrorWithStatus(err)) {
        errorStatus = err.response?.status || err.status || err.code;
      }
      
      // Don't show error UI for certain status codes that indicate "no data"
      if (errorStatus === 400 || errorStatus === 404) {
        // These typically mean no questions available, not a real error
        setQuestions([]);
        setTotalPages(0);
        setTotalElements(0);
        setCurrentPage(0);
        // Don't set error state or show toast for these cases
        return;
      }

      // Handle authentication errors
      if (errorStatus === 401) {
        const errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        setError(errorMessage);
        toastError("Lỗi xác thực", {
          description: errorMessage,
        });
        // Optionally redirect to login
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      // Handle other errors with user-friendly messages
      const errorMessage = handleDataFetchError(err);
      setError(errorMessage);
      
      // Only show toast for real errors (not 400/404)
      toastError("Lỗi khi tải danh sách câu hỏi", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.size, params?.keyword]); // Remove api objects from dependencies

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]); // Depend on the stable fetchQuestions function

  return {
    questions,
    loading,
    error,
    totalPages,
    totalElements,
    currentPage,
    refetch: fetchQuestions,
  };
};
