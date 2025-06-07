// src/hooks/use-questions.tsx
import { useState, useEffect } from "react";
import { QuestionListItem, useApi, QuestionCompletionStatus } from "@/lib/api";
import { toastError } from "@/lib/toast";

export const useQuestions = (params?: {
  page?: number;
  size?: number;
  type?: string;
  level?: string;
  search?: string;
}) => {
  const [questions, setQuestions] = useState<QuestionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(params?.page || 0);

  const api = useApi();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch questions list
      const response = await api.question.getQuestions(params);

      // Get user info to get userId
      let userInfo = null;
      try {
        userInfo = await api.user.getUserInfo();
      } catch (userError) {
        console.warn("Could not get user info, will use default status");
      }

      let questionsWithStatus = response.content.map((question) => ({
        ...question,
        status: "Not Started" as "AC" | "WA" | "TLE" | "CE" | "Not Started",
      }));

      // If we have user info, check completion status
      if (userInfo && response.content.length > 0) {
        try {
          const questionIds = response.content.map((q) => q.id);
          const completionStatuses = await api.question.checkCompletionStatus({
            questionIds,
            userId: userInfo.id,
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
    } catch (err: any) {
      const errorMessage = api.utils.formatErrorMessage(err);
      setError(errorMessage);
      toastError("Lỗi khi tải danh sách câu hỏi", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [params?.page, params?.size, params?.type, params?.level, params?.search]);

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
