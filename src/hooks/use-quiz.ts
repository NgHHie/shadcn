import { useState, useEffect } from "react";
import { useUserContext } from "@/contexts/UserContext";
import { quizService } from "@/services/quizService";
import type { PublicQuiz } from "@/services/quizService";

export const useQuiz = () => {
  const { userId } = useUserContext();
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch quizzes for current user
  const fetchQuizzes = async () => {
    if (!userId) {
      setError("User ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await quizService.getExamQuizzesByUserId(userId);
      if (
        (response.status === 1 || response.status === 200) &&
        Array.isArray(response.data)
      ) {
        setQuizzes(response.data);
      } else {
        setError("Failed to fetch quizzes");
      }
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  // Fetch quizzes on mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchQuizzes();
    }
  }, [userId]);

  // Get quiz by ID
  const getQuizById = (quizId: string) => {
    return quizzes.find((quiz) => quiz.examQuizzesId === quizId);
  };

  // Get quiz questions
  const getQuizQuestions = async (quizId: string) => {
    try {
      const response = await quizService.getQuizQuestions(quizId);
      return response.data;
    } catch (err) {
      console.error("Error fetching quiz questions:", err);
      throw err;
    }
  };

  // Create submission
  const createSubmission = async (quizId: string) => {
    if (!userId) throw new Error("User ID not found");

    try {
      const response = await quizService.createSubmission(userId, quizId);
      return response.data;
    } catch (err) {
      console.error("Error creating submission:", err);
      throw err;
    }
  };

  // Submit single answer
  const submitSingleAnswer = async (data: {
    submissionId: string;
    questionId: string;
    selectedAnswerId: string;
  }) => {
    try {
      const response = await quizService.submitSingleAnswer({
        submissionId: data.submissionId,
        questionId: data.questionId,
        selectedAnswerId: data.selectedAnswerId,
      });
      return response;
    } catch (err) {
      console.error("Error submitting answer:", err);
      throw err;
    }
  };

  // Finish submission
  const finishSubmission = async (submissionId: string) => {
    try {
      const response = await quizService.finishSubmission(submissionId);
      return response.data;
    } catch (err) {
      console.error("Error finishing submission:", err);
      throw err;
    }
  };

  return {
    quizzes,
    loading,
    error,
    fetchQuizzes,
    getQuizById,
    getQuizQuestions,
    createSubmission,
    submitSingleAnswer,
    finishSubmission,
  };
};
