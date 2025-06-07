import { useState, useEffect } from "react";
import { QuestionListItem, QuestionDetail, useApi } from "@/lib/api";
import { toastError } from "@/lib/toast";

// src/hooks/use-submission.tsx
export const useSubmission = () => {
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<any>(null);

  const api = useApi();

  // src/hooks/use-submission.tsx (nếu còn dùng)
  const submitSolution = async (
    questionId: string,
    sql: string, // thay vì sqlCode
    typeDatabaseId: string // thay vì typeDatabase
  ) => {
    try {
      setSubmitting(true);

      const result = await api.question.submitSolution({
        questionId,
        sql, // đúng format
        typeDatabaseId, // đúng format
      });

      setLastSubmission(result);
      return result;
    } catch (error) {
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const getSubmissionHistory = async (questionId: string) => {
    try {
      return await api.question.getSubmissionHistory(questionId);
    } catch (error) {
      toastError("Lỗi khi tải lịch sử nộp bài", {
        description: api.utils.formatErrorMessage(error),
      });
      throw error;
    }
  };

  return {
    submitting,
    lastSubmission,
    submitSolution,
    getSubmissionHistory,
  };
};
