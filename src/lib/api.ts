// src/lib/api.ts
import { toastError } from "@/lib/toast";
import { TokenManager } from "./token-manager";

const API_BASE_URL = "https://api.learnsql.store/api/app";

const PUBLIC_ENDPOINTS = [
  "/question", // GET /question (list questions)
  "/question/", // GET /question/{id} (get question detail)
];

// Helper function to check if endpoint is public
const isPublicEndpoint = (endpoint: string): boolean => {
  return PUBLIC_ENDPOINTS.some((publicPath) => {
    if (publicPath.endsWith("/")) {
      return endpoint.startsWith(publicPath);
    }
    return endpoint === publicPath || endpoint.startsWith(publicPath + "?");
  });
};

// Token management - Remove old TokenManager class definition since we import it

// Types
export interface QuestionDetail {
  id: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  questionCode: string;
  title: string;
  content: string;
  point: number;
  prefixCode: string;
  type:
    | "SELECT"
    | "INSERT"
    | "UPDATE"
    | "DELETE"
    | "CREATE"
    | "PROCEDURE"
    | "INDEX";
  enable: boolean;
  level: "EASY" | "MEDIUM" | "HARD";
  questionDetails: Array<{
    id: string;
    lastModifiedAt: string;
    typeDatabase: {
      id: string;
      name: string;
    };
  }>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface SubmissionRequest {
  questionId: string;
  sql: string;
  typeDatabaseId: string;
}

export interface SubmissionResponse {
  id: string;
  status: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "RUNTIME_ERROR";
  executionTime: number;
  resultRows: number;
  errorMessage?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  totalPoints: number;
  rank: number;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  status: number;
  accessToken: string;
  refreshToken: string;
}

export interface QuestionListItem {
  id: string;
  questionCode: string;
  title: string;
  type: string;
  level: string;
  point: number;
  enable: boolean;
  status?: "AC" | "WA" | "TLE" | "CE" | "Not Started";
}

// HTTP Client with error handling and auto token refresh
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available and endpoint requires it
    if (!isPublicEndpoint(endpoint)) {
      const token = TokenManager.getAccessToken();

      if (token) {
        defaultOptions.headers = {
          ...defaultOptions.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, defaultOptions);

      // Handle 401 Unauthorized - try to refresh token
      if (
        response.status === 401 &&
        retryCount === 0 &&
        !isPublicEndpoint(endpoint)
      ) {
        console.log("Access token expired, attempting refresh...");

        try {
          const newToken = await TokenManager.refreshAccessToken();
          console.log("Token refreshed successfully");

          // Retry the original request with new token
          const newHeaders = {
            ...defaultOptions.headers,
            Authorization: `Bearer ${newToken}`,
          };

          return this.request<T>(
            endpoint,
            {
              ...options,
              headers: newHeaders,
            },
            retryCount + 1
          );
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          throw new Error("Authentication failed. Please login again.");
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Initialize API client
const apiClient = new ApiClient(API_BASE_URL);

// API Service Functions
export const questionApi = {
  // Check completion status for multiple questions
  checkCompletionStatus: async (
    payload: CheckCompletionRequest
  ): Promise<QuestionCompletionStatus[]> => {
    return apiClient.post<QuestionCompletionStatus[]>(
      "/submit-history/check/complete",
      payload
    );
  },

  // Get question detail by ID
  getQuestionDetail: async (questionId: string): Promise<QuestionDetail> => {
    return apiClient.get<QuestionDetail>(`/question/${questionId}`);
  },

  // Get list of questions with pagination
  getQuestions: async (params?: {
    page?: number;
    size?: number;
    type?: string;
    level?: string;
    search?: string;
  }): Promise<{
    content: QuestionListItem[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.size) searchParams.append("size", params.size.toString());
    if (params?.type) searchParams.append("type", params.type);
    if (params?.level) searchParams.append("level", params.level);
    if (params?.search) searchParams.append("search", params.search);

    const endpoint = `/question${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;
    return apiClient.get(endpoint);
  },

  // Execute SQL query (for Run button)
  executeSql: async (payload: {
    questionId: string;
    sql: string;
    typeDatabaseId: string;
  }): Promise<{
    status: number;
    result: any[] | string;
    typeQuery: string;
    timeExec: number;
    testPass: number;
    totalTest: number;
  }> => {
    return apiClient.post("/executor/user", payload);
  },

  // Submit SQL solution (NEW - for real submission with WebSocket)
  submitSolution: async (payload: {
    questionId: string;
    sql: string;
    typeDatabaseId: string;
  }): Promise<{
    status: number;
    timeExec: number;
    testPass: number;
    totalTest: number;
    timeSubmit: string;
    submitId: string;
  }> => {
    return apiClient.post("/executor/submit", payload);
  },

  // Get submission history for a question (LEGACY - keeping for compatibility)
  getSubmissionHistory: async (
    questionId: string
  ): Promise<SubmissionResponse[]> => {
    return apiClient.get<SubmissionResponse[]>(
      `/submission/question/${questionId}`
    );
  },

  // Get submission history for user (NEW)
  getUserSubmissionHistory: async (
    userId: string,
    params?: {
      questionId?: string;
      page?: number;
      size?: number;
    }
  ): Promise<{
    content: any[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }> => {
    const searchParams = new URLSearchParams();

    if (params?.page !== undefined)
      searchParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      searchParams.append("size", params.size.toString());
    if (params?.questionId)
      searchParams.append("questionId", params.questionId);

    const endpoint = `/submit-history/user/${userId}${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;
    return apiClient.get(endpoint);
  },
};

export const userApi = {
  // Get current user profile
  getProfile: async (): Promise<UserProfile> => {
    return apiClient.get<UserProfile>("/user/profile");
  },

  // Get user info (NEW - specific endpoint)
  getUserInfo: async (): Promise<{
    id: string;
    createdAt: string;
    createdBy: string;
    lastModifiedAt: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar: string;
    email: string;
    phone: string;
    birthDay: string;
    role: string;
    userCode: string;
    userPrefix: string;
    fullName: string;
    isPremium: boolean;
  }> => {
    return apiClient.get("/user/info");
  },

  // Update user profile
  updateProfile: async (
    profileData: Partial<UserProfile>
  ): Promise<UserProfile> => {
    return apiClient.put<UserProfile>("/user/profile", profileData);
  },

  // Get user statistics
  getStatistics: async (): Promise<{
    totalSolved: number;
    totalSubmissions: number;
    acceptanceRate: number;
    pointsByType: Record<string, number>;
    submissionsByMonth: Array<{ month: string; count: number }>;
  }> => {
    return apiClient.get("/user/statistics");
  },
};

export const rankingApi = {
  // Get global ranking
  getGlobalRanking: async (params?: {
    page?: number;
    size?: number;
  }): Promise<{
    content: Array<{
      rank: number;
      user: UserProfile;
      totalPoints: number;
      solvedCount: number;
    }>;
    totalElements: number;
    totalPages: number;
  }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.size) searchParams.append("size", params.size.toString());

    const endpoint = `/ranking${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;
    return apiClient.get(endpoint);
  },
};

export const contestApi = {
  // Get active contests
  getActiveContests: async (): Promise<
    Array<{
      id: string;
      title: string;
      description: string;
      startTime: string;
      endTime: string;
      participants: number;
      questions: QuestionListItem[];
    }>
  > => {
    return apiClient.get("/contest/active");
  },

  // Join contest
  joinContest: async (contestId: string): Promise<{ success: boolean }> => {
    return apiClient.post(`/contest/${contestId}/join`);
  },
};

// Auth API
export const authApi = {
  // Login with correct endpoint and payload format
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(
      "https://api.learnsql.store/api/app/user/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          remember: credentials.remember ?? true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Login failed: ${response.status} ${response.statusText}`
      );
    }

    const data: LoginResponse = await response.json();

    if (data.status !== 1) {
      throw new Error("Login failed: Invalid response status");
    }

    if (!data.accessToken || !data.refreshToken) {
      throw new Error("Login failed: Missing tokens in response");
    }

    // Store tokens
    TokenManager.setTokens(data.accessToken, data.refreshToken);
    console.log("✅ Login successful, tokens stored");

    return data;
  },

  // Logout - clear tokens
  logout: async (): Promise<void> => {
    try {
      const token = TokenManager.getAccessToken();

      if (token) {
        try {
          await fetch("https://api.learnsql.store/api/app/user/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("✅ Server logout successful");
        } catch (error) {
          console.warn(
            "Server logout failed, but continuing with local logout:",
            error
          );
        }
      }
    } finally {
      // Always clear local tokens
      TokenManager.clearTokens();
      console.log("✅ Local tokens cleared");
    }
  },

  // Check if user is logged in (simple check)
  isLoggedIn: (): boolean => {
    return TokenManager.hasValidTokens();
  },

  // Refresh token
  refreshToken: async (): Promise<{
    accessToken: string;
    refreshToken: string;
  }> => {
    const newAccessToken = await TokenManager.refreshAccessToken();
    const refreshToken = TokenManager.getRefreshToken();

    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken || "",
    };
  },

  // Get user info from API (not from token)
  getCurrentUser: async (): Promise<any> => {
    // Call API to get current user info instead of parsing token
    return apiClient.get("/user/info");
  },
};

// Utility functions
export const apiUtils = {
  isAuthenticated: (): boolean => {
    return TokenManager.hasValidTokens();
  },

  getAuthToken: (): string | null => {
    return TokenManager.getAccessToken();
  },

  getRefreshToken: (): string | null => {
    return TokenManager.getRefreshToken();
  },

  clearAuthData: (): void => {
    TokenManager.clearTokens();
  },

  // Helper function to check if error is auth-related
  isAuthError: (error: any): boolean => {
    if (typeof error === "string") {
      return (
        error.toLowerCase().includes("authentication") ||
        error.toLowerCase().includes("unauthorized") ||
        error.toLowerCase().includes("token") ||
        error.toLowerCase().includes("login")
      );
    }

    if (error?.message) {
      const message = error.message.toLowerCase();
      return (
        message.includes("authentication") ||
        message.includes("unauthorized") ||
        message.includes("token") ||
        message.includes("login") ||
        message.includes("401")
      );
    }

    return false;
  },

  // Simple error message formatting without JWT parsing
  formatErrorMessage: (error: any): string => {
    let message = "";

    if (typeof error === "string") {
      message = error;
    } else if (error?.message) {
      message = error.message;
    } else {
      message = "An unexpected error occurred";
    }

    // Check if this is an auth error and show appropriate toast
    // if (apiUtils.isAuthError(error)) {
    //   setTimeout(() => {
    //     import("@/lib/toast").then(({ toastError }) => {
    //       toastError("Lỗi xác thực", {
    //         description: message,
    //         duration: 6000,
    //         action: {
    //           label: "Đăng nhập lại",
    //           onClick: () => {
    //             if (typeof window !== "undefined") {
    //               window.location.href = "/login";
    //             }
    //           },
    //         },
    //       });
    //     });
    //   }, 100);
    // }

    return message;
  },

  refreshAccessToken: async (): Promise<string> => {
    try {
      return await TokenManager.refreshAccessToken();
    } catch (error) {
      // Clear tokens and redirect on refresh failure
      TokenManager.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw error;
    }
  },

  requireAuth: (): boolean => {
    if (!TokenManager.hasValidTokens()) {
      // Show toast and redirect
      setTimeout(() => {
        toastError("Vui lòng đăng nhập để tiếp tục", {
          action: {
            label: "Đăng nhập",
            onClick: () => {
              if (typeof window !== "undefined") {
                window.location.href = "/login";
              }
            },
          },
        });
      }, 100);

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return false;
    }
    return true;
  },
};
// Custom hooks for React components
export const useApi = () => {
  return {
    question: questionApi,
    user: userApi,
    ranking: rankingApi,
    contest: contestApi,
    auth: authApi,
    utils: apiUtils,
  };
};

export default {
  question: questionApi,
  user: userApi,
  ranking: rankingApi,
  contest: contestApi,
  auth: authApi,
  utils: apiUtils,
};

// Add these new interfaces
export interface QuestionCompletionStatus {
  status: "AC" | "WA" | "TLE" | "CE" | "Not Started";
  questionId: string;
  completed: "done" | "not_done";
}

export interface CheckCompletionRequest {
  questionIds: string[];
  userId: string;
}
