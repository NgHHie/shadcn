// src/lib/apiContest.ts
import { ApiClient } from "./api";

const API_BASE_URL = "https://api.learnsql.store/api/app";

// Initialize API client specifically for contest operations
const apiClient = new ApiClient(API_BASE_URL);

// Types for contest submission operations
export interface ContestSubmissionRequest {
  isSubmitContest: boolean;
  questionId: string;
  sql: string;
  typeDatabaseId: string;
  contestId?: string;
  questionContestId?: string;
}

export interface ContestSubmissionResponse {
  submitId: string;
  timeSubmit: string;
  timeExec: number;
  statusSubmit: "AC" | "WA" | "TLE" | "CE" | "PENDING";
  testPass: number;
  totalTest: number;
}

export interface ContestExecutionRequest {
  questionId: string;
  sql: string;
  typeDatabaseId: string;
}

export interface ContestExecutionResponse {
  success: boolean;
  result?: any;
  error?: string;
  executionTime?: number;
}

export interface FileSubmissionRequest {
  questionId: string;
  typeDatabaseId: string;
  contestId: string;
  questionContestId: string;
  file: File;
}

export interface ContestSubmissionHistoryParams {
  questionContestId: string;
  page?: number;
  size?: number;
}

export interface ContestSubmissionHistoryResponse {
  content: Array<{
    id: string;
    createdAt: string;
    createdBy: string;
    lastModifiedAt: string;
    timeSubmit: string;
    timeout: number;
    status: "AC" | "WA" | "TLE" | "CE" | "PENDING";
    user: {
      firstName: string;
      lastName: string;
      userCode: string;
      fullName: string;
    };
    testPass: number;
    totalTest: number;
    question: {
      questionCode: string;
      title: string;
    };
    database: {
      id: string;
      name: string;
    };
  }>;
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Types for tracker operations
export interface TrackerData {
  actionType:
    | "EXTERNAL_LINK_CLICK"
    | "TAB_SWITCH"
    | "TAB_RETURN"
    | "COPY"
    | "PASTE";
  detail: string;
  contestId: string;
}

// Types for contest detail with tracker
export interface ContestDetailWithTracker {
  id: string;
  contestCode: string;
  name: string;
  startDatetime: string;
  endDatetime: string;
  mode: "PRACTICE" | "EXAM";
  status: "OPEN" | "CLOSED" | "SCHEDULED";
  isTracker: boolean;
  description?: string;
  isPublic: boolean;
  numberUser: number;
  numberQuestion: number;
  duration: number;
}

// Contest API operations
export const contestApi = {
  /**
   * Submit code for contest evaluation
   */
  submitCode: async (
    payload: ContestSubmissionRequest
  ): Promise<ContestSubmissionResponse> => {
    try {
      const response = await apiClient.post<ContestSubmissionResponse>(
        "/executor/submit",
        payload
      );
      return response;
    } catch (error) {
      console.error("Contest submission failed:", error);
      throw error;
    }
  },

  /**
   * Execute code without submitting (for testing)
   */
  executeCode: async (
    payload: ContestExecutionRequest
  ): Promise<ContestExecutionResponse> => {
    try {
      const response = await apiClient.post<ContestExecutionResponse>(
        "/executor/execute",
        payload
      );
      return response;
    } catch (error) {
      console.error("Contest execution failed:", error);
      throw error;
    }
  },

  /**
   * Submit file for contest
   */
  submitFile: async (
    payload: FileSubmissionRequest
  ): Promise<ContestSubmissionResponse> => {
    try {
      const formData = new FormData();
      formData.append("file", payload.file);

      const params = new URLSearchParams({
        questionId: payload.questionId,
        typeDatabaseId: payload.typeDatabaseId,
        isSubmitContest: "true",
        contestId: payload.contestId,
        questionContestId: payload.questionContestId,
      });

      const response = await apiClient.post<ContestSubmissionResponse>(
        `/executor/submit-file?${params.toString()}`,
        formData
      );
      return response;
    } catch (error) {
      console.error("Contest file submission failed:", error);
      throw error;
    }
  },

  /**
   * Get contest submission history for a user
   */
  getSubmissionHistory: async (
    params: ContestSubmissionHistoryParams
  ): Promise<ContestSubmissionHistoryResponse> => {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append("questionContestId", params.questionContestId);
      searchParams.append("page", (params.page || 0).toString());
      searchParams.append("size", (params.size || 20).toString());

      const endpoint = `/submit-contest/user?${searchParams.toString()}`;
      return await apiClient.get<ContestSubmissionHistoryResponse>(endpoint);
    } catch (error) {
      console.error("Failed to fetch contest submission history:", error);
      throw error;
    }
  },

  /**
   * Check contest submission status
   */
  checkSubmissionStatus: async (
    submitId: string
  ): Promise<{
    status: "AC" | "WA" | "TLE" | "CE" | "PENDING";
    testPass: number;
    totalTest: number;
    executionTime: number;
  }> => {
    try {
      return await apiClient.get(`/submit-contest/status/${submitId}`);
    } catch (error) {
      console.error("Failed to check submission status:", error);
      throw error;
    }
  },

  /**
   * Get contest question details
   */
  getContestQuestion: async (questionId: string) => {
    try {
      return await apiClient.get(`/question/${questionId}`);
    } catch (error) {
      console.error("Failed to fetch contest question:", error);
      throw error;
    }
  },

  /**
   * Validate SQL query before submission
   */
  validateQuery: async (payload: {
    sql: string;
    typeDatabaseId: string;
  }): Promise<{
    isValid: boolean;
    syntaxErrors?: string[];
    warnings?: string[];
  }> => {
    try {
      return await apiClient.post("/executor/validate", payload);
    } catch (error) {
      console.error("SQL validation failed:", error);
      throw error;
    }
  },

  /**
   * Get available databases for a contest question
   */
  getAvailableDatabases: async (
    questionId: string
  ): Promise<
    Array<{
      id: string;
      name: string;
      description?: string;
    }>
  > => {
    try {
      return await apiClient.get(`/question/${questionId}/databases`);
    } catch (error) {
      console.error("Failed to fetch available databases:", error);
      throw error;
    }
  },

  /**
   * Send tracker log data
   */
  sendLogTracker: async (payload: TrackerData): Promise<any> => {
    try {
      const response = await apiClient.post<any>("/tracker/push", payload);
      return response;
    } catch (error) {
      console.error("Failed to send tracker log:", error);
      throw error;
    }
  },

  /**
   * Check contest tracker status and get contest details
   */
  checkContestTracker: async (contestId: string): Promise<boolean> => {
    try {
      const data = await apiClient.get<ContestDetailWithTracker>(
        `/contest/${contestId}`
      );
      return data.isTracker || false;
    } catch (error) {
      console.error("Failed to check contest tracker:", error);
      return false;
    }
  },

  /**
   * Get contest detail with tracker info for editor
   */
  getContestForEditor: async (
    contestId: string
  ): Promise<{
    contest: ContestDetailWithTracker;
    isTrackerEnabled: boolean;
  }> => {
    try {
      const contestData = await apiClient.get<ContestDetailWithTracker>(
        `/contest/${contestId}`
      );

      return {
        contest: contestData,
        isTrackerEnabled: contestData.isTracker || false,
      };
    } catch (error) {
      console.error("Failed to fetch contest for editor:", error);
      throw error;
    }
  },

  /**
   * Get contest detail with tracker info (separate method)
   */
  getContestDetailWithTracker: async (
    contestId: string
  ): Promise<ContestDetailWithTracker> => {
    try {
      return await apiClient.get<ContestDetailWithTracker>(
        `/contest/${contestId}`
      );
    } catch (error) {
      console.error("Failed to fetch contest detail with tracker:", error);
      throw error;
    }
  },
};

// Helper functions for common contest operations
export const contestHelpers = {
  /**
   * Format submission result for display
   */
  formatSubmissionResult: (submission: ContestSubmissionResponse) => {
    const statusMap = {
      AC: "Accepted",
      WA: "Wrong Answer",
      TLE: "Time Limit Exceeded",
      CE: "Compilation Error",
      PENDING: "Pending",
    };

    return {
      status: statusMap[submission.statusSubmit] || submission.statusSubmit,
      testsPassed: `${submission.testPass}/${submission.totalTest}`,
      executionTime: `${submission.timeExec}ms`,
      timestamp: new Date(submission.timeSubmit).toLocaleString(),
    };
  },

  /**
   * Check if submission was successful
   */
  isSubmissionSuccessful: (submission: ContestSubmissionResponse): boolean => {
    return submission.statusSubmit === "AC";
  },

  /**
   * Calculate submission score based on test results
   */
  calculateScore: (submission: ContestSubmissionResponse): number => {
    if (submission.totalTest === 0) return 0;
    return Math.round((submission.testPass / submission.totalTest) * 100);
  },

  /**
   * Get status color for UI display
   */
  getStatusColor: (status: string): string => {
    const colorMap: Record<string, string> = {
      AC: "green",
      WA: "red",
      TLE: "orange",
      CE: "purple",
      PENDING: "blue",
    };
    return colorMap[status] || "gray";
  },

  /**
   * Validate SQL file before upload
   */
  validateSqlFile: (file: File): { isValid: boolean; error?: string } => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith(".sql")) {
      return { isValid: false, error: "File must have .sql extension" };
    }

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      return { isValid: false, error: "File size must not exceed 1MB" };
    }

    return { isValid: true };
  },

  /**
   * Parse error message from API response
   */
  parseErrorMessage: (error: any): string => {
    if (typeof error === "string") return error;

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.message) {
      return error.message;
    }

    return "An unexpected error occurred";
  },
};

export default contestApi;
