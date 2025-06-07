import { useState, useEffect } from "react";
import { QuestionListItem, QuestionDetail, useApi } from "@/lib/api";
import { toastError } from "@/lib/toast";

// src/hooks/use-submission.tsx
export const useSubmission = () => {
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<any>(null);

  const api = useApi();

  const submitSolution = async (
    questionId: string,
    sqlCode: string,
    typeDatabase: string
  ) => {
    try {
      setSubmitting(true);

      const result = await api.question.submitSolution({
        questionId,
        sqlCode,
        typeDatabase,
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
