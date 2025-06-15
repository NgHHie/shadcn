import { useState, useEffect } from "react";
import { QuestionDetail, useApi } from "@/lib/api";
import { toastError } from "@/lib/toast";

// src/hooks/use-question-detail.tsx
export const useQuestionDetail = (questionId: string | undefined) => {
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();

  const fetchQuestion = async () => {
    if (!questionId) {
      setError("Question ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const questionData = await api.question.getQuestionDetail(questionId);
      setQuestion(questionData);
    } catch (err: any) {
      const errorMessage = api.utils.formatErrorMessage(err);
      setError(errorMessage);
      toastError("Lỗi khi tải đề bài", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  return {
    question,
    loading,
    error,
    refetch: fetchQuestion,
  };
};
