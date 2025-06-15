import axios from "axios";
import type { PublicQuiz } from "./quizService";
import { TokenManager } from "@/lib/token-manager";

const API_BASE_URL = import.meta.env.VITE_QUIZ_BASE_URL;

export interface QuizSession {
  sessionId: string;
  examQuizzesId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: "active" | "completed" | "expired";
  currentQuestionIndex: number;
  answers: Record<string, string[]>; // questionId -> selectedAnswerIds
  flaggedQuestions: string[];
  timeRemaining: number; // in seconds
}

export interface QuizSubmission {
  sessionId: string;
  examQuizzesId: string;
  userId: string;
  answers: Record<string, string[]>;
  submittedAt: string;
  timeSpent: number; // in seconds
}

export interface QuizResult {
  submissionId: string;
  examQuizzesId: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  submittedAt: string;
  gradedAt: string;
  answers: {
    questionId: string;
    selectedAnswers: string[];
    correctAnswers: string[];
    isCorrect: boolean;
    points: number;
  }[];
}

export interface StartQuizResponse {
  status: number;
  message: string;
  data: {
    sessionId: string;
    quiz: PublicQuiz;
    timeLimit: number; // in seconds
    startTime: string;
  };
  timestamp: string;
}

export interface SubmitQuizResponse {
  status: number;
  message: string;
  data: QuizResult;
  timestamp: string;
}

export interface SaveAnswerRequest {
  sessionId: string;
  questionId: string;
  selectedAnswers: string[];
  isFlagged?: boolean;
}

export interface SaveAnswerResponse {
  status: number;
  message: string;
  data: {
    saved: boolean;
    timestamp: string;
  };
}

class QuizSubmissionService {
  /**
   * Start a new quiz session
   */
  async startQuiz(examQuizzesId: string): Promise<StartQuizResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/quiz/start`,
        { examQuizzesId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error starting quiz:", error);
      throw error;
    }
  }

  /**
   * Save answer for a question
   */
  async saveAnswer(request: SaveAnswerRequest): Promise<SaveAnswerResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/quiz/save-answer`,
        request,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error saving answer:", error);
      throw error;
    }
  }

  /**
   * Submit quiz for grading
   */
  async submitQuiz(sessionId: string): Promise<SubmitQuizResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/quiz/submit`,
        { sessionId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error submitting quiz:", error);
      throw error;
    }
  }

  /**
   * Get quiz session status
   */
  async getQuizSession(sessionId: string): Promise<QuizSession> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/quiz/session/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error getting quiz session:", error);
      throw error;
    }
  }

  /**
   * Get quiz result
   */
  async getQuizResult(submissionId: string): Promise<QuizResult> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/quiz/result/${submissionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error getting quiz result:", error);
      throw error;
    }
  }

  /**
   * Flag/unflag a question
   */
  async toggleQuestionFlag(
    sessionId: string,
    questionId: string,
    isFlagged: boolean
  ): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/quiz/flag-question`,
        { sessionId, questionId, isFlagged },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
    } catch (error) {
      console.error("Error toggling question flag:", error);
      throw error;
    }
  }

  private getAuthToken(): string | null {
    return TokenManager.getAccessToken();
  }
}

export const quizSubmissionService = new QuizSubmissionService();
