// src/hooks/use-questions.tsx
import { useState, useEffect } from "react";
import { QuestionListItem, QuestionDetail, useApi } from "@/lib/api";
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

      const response = await api.question.getQuestions(params);

      setQuestions(response.content);
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
