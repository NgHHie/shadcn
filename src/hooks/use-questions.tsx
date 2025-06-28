// src/hooks/use-questions.tsx - Updated to use new search API

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  SetStateAction,
} from "react";
import { useApi } from "@/lib/api";
import { QuestionListItem, QuestionCompletionStatus } from "@/lib/api";
import { toastError } from "@/lib/toast";
import { handleDataFetchError } from "@/lib/error-handler";

// Types
export interface QuestionFilterCriteria {
  keyword?: string;
  questionCode?: string;
  title?: string;
  type?:
    | "SELECT"
    | "INSERT"
    | "UPDATE"
    | "DELETE"
    | "DROP"
    | "CREATE"
    | "ALTER"
    | "PROCEDURE"
    | "TRIGGER"
    | "TRUNCATE";
  level?: "EASY" | "MEDIUM" | "HARD";
  answerStatus?: "AC" | "WA" | "TLE" | "CE" | "Not Started";
  userId?: string;
}
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string[];
}

export interface UseQuestionsParams {
  pagination: PaginationParams;
  criteria?: QuestionFilterCriteria;
  autoFetch?: boolean; // Option to disable auto-fetch on mount
}

export const useQuestions = (params: UseQuestionsParams) => {
  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(params.pagination.page || 0);

  const api = useApi();
  const userInfoRef = useRef<{ id: string } | null>(null);

  const fetchQuestions = useCallback(
    async (
      paginationParams?: PaginationParams,
      filterCriteria?: QuestionFilterCriteria
    ) => {
      try {
        setLoading(true);
        setError(null);

        // Use provided params or fall back to hook params
        const pageable = paginationParams || params.pagination;
        const criteria = filterCriteria || params.criteria || {};

        // Get user info to get userId (only once and cache it)
        if (!userInfoRef.current) {
          try {
            const userInfo = await api.user.getUserInfo();
            userInfoRef.current = { id: userInfo.id };
          } catch (userError) {
            console.warn("Could not get user info, will use default status");
          }
        }

        // Call new search API
        const response = await api.question.searchQuestions(pageable, criteria);

        let questionsWithStatus: SetStateAction<QuestionListItem[]> = [];
        if (response.content) {
          questionsWithStatus = response.content.map((question) => ({
            ...question,
            status: "Not Started" as "AC" | "WA" | "TLE" | "CE" | "Not Started",
          }));
        }

        // If we have user info, check completion status
        if (
          userInfoRef.current &&
          response.content &&
          response.content.length > 0
        ) {
          try {
            const questionIds = response.content.map((q) => q.id);
            const completionStatuses = await api.question.checkCompletionStatus(
              {
                questionIds,
                userId: userInfoRef.current.id,
              }
            );

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
        const isErrorWithStatus = (
          error: unknown
        ): error is {
          response?: { status?: number };
          status?: number;
          code?: number;
        } => {
          return typeof error === "object" && error !== null;
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
          const errorMessage =
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
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
    },
    []
  ); // Remove dependencies to make it stable

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (params.autoFetch !== false) {
      fetchQuestions();
    }
  }, [fetchQuestions, params.autoFetch]);

  // Method to search with new criteria
  const searchWithFilter = useCallback(
    async (
      criteria: QuestionFilterCriteria,
      pagination?: Partial<PaginationParams>
    ) => {
      const newPagination: PaginationParams = {
        ...params.pagination,
        ...pagination,
        page: pagination?.page ?? 0, // Reset to first page when searching
      };

      // Get user info if not available
      if (!userInfoRef.current) {
        try {
          const userInfo = await api.user.getUserInfo();
          userInfoRef.current = { id: userInfo.id };
        } catch (userError) {
          console.warn("Could not get user info, will use default status");
        }
      }

      // Check if userId is not provided and add it if user info is available
      const enhancedCriteria = {
        ...criteria,
        userId: criteria.userId || userInfoRef.current?.id,
      };

      return fetchQuestions(newPagination, enhancedCriteria);
    },
    [fetchQuestions, params.pagination, api.user]
  );

  // Method to change page
  const changePage = useCallback(
    (page: number) => {
      const newPagination: PaginationParams = {
        ...params.pagination,
        page,
      };

      return fetchQuestions(newPagination, params.criteria);
    },
    [fetchQuestions, params.pagination, params.criteria]
  );

  // Method to change page size
  const changePageSize = useCallback(
    (size: number) => {
      const newPagination: PaginationParams = {
        ...params.pagination,
        page: 0, // Reset to first page when changing page size
        size,
      };

      return fetchQuestions(newPagination, params.criteria);
    },
    [fetchQuestions, params.pagination, params.criteria]
  );

  return {
    // Data
    questions,
    loading,
    error,
    totalPages,
    totalElements,
    currentPage,

    // Methods
    refetch: fetchQuestions,
    searchWithFilter,
    changePage,
    changePageSize,
  };
};
