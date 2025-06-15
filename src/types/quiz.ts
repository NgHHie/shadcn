// Quiz Types
export interface QuestionStatus {
  id: string;
  isAnswered: boolean;
  isFlagged: boolean;
  isActive: boolean;
}

export interface ExamUserQuizzesQuestion {
  id: string;
  content: string;
  type: "singleChoice" | "multipleChoice";
  difficultyLevel: "Easy" | "Medium" | "Hard";
  media_url: string | null;
  createdBy: string;
  categoryId: string;
  answers: Array<{
    id: string;
    content: string;
    questionId: string;
    correct: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ExamUserQuizzesData {
  examUserQuizzesId: string;
  examQuizzesId: string;
  userId: string;
  questions: ExamUserQuizzesQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface ExamUserQuizzesResponse {
  status: number;
  message: string;
  data: ExamUserQuizzesData;
  timestamp: string;
}

export interface CreateSubmissionResponse {
  status: number;
  message: string;
  data: string; // submissionId
  timestamp: string;
}

export interface SubmitAnswerRequest {
  submissionId: string;
  questionId: string;
  listAnswerIdsJson: string[];
}

export interface SubmitSingleAnswerRequest {
  submissionId: string;
  questionId: string;
  selectedAnswerId: string;
}

export interface SubmitSingleAnswerResponse {
  status: number;
  message: string;
  data: boolean;
  timestamp: string;
}

export interface FinishSubmissionResponse {
  status: number;
  message: string;
  data: {
    submissionId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
  };
  timestamp: string;
}
