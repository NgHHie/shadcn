// src/lib/api.ts
import { toastError } from "@/lib/toast";
import { TokenManager } from "./token-manager";
import {
  Contest,
  ContestListResponse,
  ContestJoinStatus,
  CheckJoinRequest,
  JoinContestRequest,
} from "@/types/contest";
import {
  ContestJoinedDetail,
  ContestQuestionStatus,
  CheckQuestionStatusRequest,
} from "@/types/contest-joined";

import { ContestWaitingData } from "@/types/contest-waiting";

const API_BASE_URL = "https://api.learnsql.store/api/app";
const API_AUTH_URL = "https://api.learnsql.store/api/auth";

const PUBLIC_ENDPOINTS = [
  "/hiep", // GET /question (list questions)
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

export interface RegisterRequest {
  username: string;
  password: string;
  fullName?: string;
}

export interface RegisterResponse {
  status: number;
  message: string;
  data?: unknown;
}

export interface QuestionListItem {
  id: string;
  questionCode: string;
  title: string;
  type: string;
  level: string;
  point: number;
  enable: boolean;
  totalSub: number;
  status?: "AC" | "WA" | "TLE" | "CE" | "Not Started";
}

export interface ScheduleClass {
  id: string;
  subject: string;
  code: string;
  group: string;
  room: string;
  building: string;
  instructor: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  startTimeSlot: number;
  duration: number;
  color?: string;
  type: "lecture" | "lab" | "practice";
}

export interface ScheduleResponse {
  weekStart: string;
  classes: ScheduleClass[];
  // Add more fields if needed based on actual API response
}

export interface Semester {
  id: string;
  semesterCode: number;
  semesterName: string;
  startDate: string;
  endDate: string;
}

export interface SemestersResponse {
  semesters: Semester[];
  totalSemesters: number;
}

// HTTP Client with error handling and auto token refresh
export class ApiClient {
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

    if (!isPublicEndpoint(endpoint)) {
      const token = TokenManager.getAccessToken();
      const refreshToken = TokenManager.getRefreshToken();

      if (token) {
        defaultOptions.headers = {
          ...defaultOptions.headers,
          Authorization: `Bearer ${token}`,
        };
      } else if (refreshToken && retryCount === 0) {
        try {
          const newToken = await TokenManager.refreshAccessToken();
          defaultOptions.headers = {
            ...defaultOptions.headers,
            Authorization: `Bearer ${newToken}`,
          };
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // Delay trước khi redirect để tránh race condition
          setTimeout(() => {
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }, 1000);
          throw new Error("Authentication failed. Please login again.");
        }
      }
    }

    try {
      const response = await fetch(url, defaultOptions);

      if (
        response.status === 401 &&
        retryCount === 0 &&
        !isPublicEndpoint(endpoint)
      ) {
        try {
          const newToken = await TokenManager.refreshAccessToken();

          const newHeaders = {
            ...defaultOptions.headers,
            Authorization: `Bearer ${newToken}`,
          };

          // Đảm bảo token đã được set trước khi retry
          await new Promise((resolve) => setTimeout(resolve, 100));

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

          // Delay redirect để tránh conflict với AuthGuard
          setTimeout(() => {
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }, 1000);

          throw new Error("Authentication failed. Please login again.");
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Create error object that preserves the full response structure
        const error = new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        ) as Error & {
          response?: {
            status: number;
            data: unknown;
          };
          status?: number;
        };

        // Attach response data for error handler to access
        error.response = {
          status: response.status,
          data: errorData,
        };
        error.status = response.status;

        throw error;
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

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
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
const apiAuth = new ApiClient(API_AUTH_URL);

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
    keyword?: string; // Đổi từ type, level, search thành keyword
  }): Promise<{
    content: QuestionListItem[];
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
    if (params?.keyword) searchParams.append("keyword", params.keyword);

    const endpoint = `/question${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;
    return apiClient.get(endpoint);
  },

  // NEW API - Search questions with filter criteria
  searchQuestions: async (
    pageable: {
      page: number;
      size: number;
      sort?: string[];
    },
    criteria: {
      keyword?: string;
      questionCode?: string;
      title?: string;
      type?:
        | "SELECT"
        | "INSERT"
        | "UPDATE"
        | "DELETE"
        | "DROP"
        | "CREATE"
        | "ALTER"
        | "PROCEDURE"
        | "TRIGGER"
        | "TRUNCATE";
      level?: "EASY" | "MEDIUM" | "HARD";
    }
  ): Promise<{
    content: QuestionListItem[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
  }> => {
    // Build pageable params
    const searchParams = new URLSearchParams();
    searchParams.append("page", pageable.page.toString());
    searchParams.append("size", pageable.size.toString());

    if (pageable.sort && pageable.sort.length > 0) {
      pageable.sort.forEach((sortParam) => {
        searchParams.append("sort", sortParam);
      });
    }

    const endpoint = `/question/search?${searchParams.toString()}`;

    return apiClient.post(endpoint, criteria);
  },

  // Execute SQL query (for Run button)
  executeSql: async (payload: {
    questionId: string;
    sql: string;
    typeDatabaseId: string;
  }): Promise<{
    status: number;
    result: unknown[] | string;
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
    content: unknown[];
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
    return apiClient.get<{
      totalSolved: number;
      totalSubmissions: number;
      acceptanceRate: number;
      pointsByType: Record<string, number>;
      submissionsByMonth: Array<{ month: string; count: number }>;
    }>("/user/statistics");
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
  // Get list of contests with pagination
  getContests: async (params?: {
    page?: number;
    size?: number;
  }): Promise<ContestListResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.page !== undefined) {
      searchParams.append("page", params.page.toString());
    }
    if (params?.size !== undefined) {
      searchParams.append("size", params.size.toString());
    }

    const endpoint = `/contest${
      searchParams.toString() ? `?${searchParams}` : ""
    }`;
    return apiClient.get<ContestListResponse>(endpoint);
  },

  // Get contests that user has joined
  getJoinedContests: async (): Promise<Contest[]> => {
    return apiClient.get<Contest[]>("/contest/user/joined");
  },

  // Check join status for multiple contests
  checkJoinStatus: async (
    payload: CheckJoinRequest
  ): Promise<ContestJoinStatus[]> => {
    return apiClient.post<ContestJoinStatus[]>(
      "/user-contest/check-join",
      payload
    );
  },

  // Join contest (NEW API endpoint)
  joinContest: async (
    payload: JoinContestRequest
  ): Promise<{ success: boolean; message?: string }> => {
    return apiClient.post("/user-contest/join", payload);
  },

  // Get contest details (you might need this later)
  getContestDetail: async (contestId: string): Promise<Contest> => {
    return apiClient.get<Contest>(`/contest/${contestId}`);
  },

  getContestWaiting: async (contestId: string): Promise<ContestWaitingData> => {
    return apiClient.get<ContestWaitingData>(`/contest/waiting/${contestId}`);
  },
};

export const contestJoinedApi = {
  // Get contest details for joined page
  getContestDetail: async (contestId: string): Promise<ContestJoinedDetail> => {
    return apiClient.get<ContestJoinedDetail>(`/contest/${contestId}`);
  },

  // Check question completion status
  checkQuestionStatus: async (
    payload: CheckQuestionStatusRequest
  ): Promise<ContestQuestionStatus[]> => {
    return apiClient.post<ContestQuestionStatus[]>(
      "/submit-contest/check/complete",
      payload
    );
  },
};

export const scheduleApi = {
  // Get authenticated schedule (thời khóa biểu)
  getSchedule: async (semesterCode?: number): Promise<ScheduleResponse> => {
    const params = semesterCode ? `?semesterCode=${semesterCode}` : "";
    return apiAuth.get<ScheduleResponse>(`/schedule${params}`);
  },

  // Get semesters list
  getSemesters: async (): Promise<SemestersResponse> => {
    return apiAuth.get<SemestersResponse>("/schedule/semesters");
  },

  // Đồng bộ thời khóa biểu từ QLDT/PTIT
  syncFromPtit: async (): Promise<{ success: boolean; message?: string }> => {
    return apiAuth.post<{ success: boolean; message?: string }>(
      "/schedule/sync-from-ptit"
    );
  },
};

export const scheduleApi = {
  // Get authenticated schedule (thời khóa biểu)
  getSchedule: async (semesterCode?: number): Promise<ScheduleResponse> => {
    const params = semesterCode ? `?semesterCode=${semesterCode}` : "";
    return apiAuth.get<ScheduleResponse>(`/schedule${params}`);
  },

  // Get semesters list
  getSemesters: async (): Promise<SemestersResponse> => {
    return apiAuth.get<SemestersResponse>("/schedule/semesters");
  },

  // Đồng bộ thời khóa biểu từ QLDT/PTIT
  syncFromPtit: async (): Promise<{ success: boolean; message?: string }> => {
    return apiAuth.post<{ success: boolean; message?: string }>(
      "/schedule/sync-from-ptit"
    );
  },
};

export const scheduleApi = {
  // Get authenticated schedule (thời khóa biểu)
  getSchedule: async (semesterCode?: number): Promise<ScheduleResponse> => {
    const params = semesterCode ? `?semesterCode=${semesterCode}` : "";
    return apiAuth.get<ScheduleResponse>(`/schedule${params}`);
  },

  // Get semesters list
  getSemesters: async (): Promise<SemestersResponse> => {
    return apiAuth.get<SemestersResponse>("/schedule/semesters");
  },

  // Đồng bộ thời khóa biểu từ QLDT/PTIT
  syncFromPtit: async (): Promise<{ success: boolean; message?: string }> => {
    return apiAuth.post<{ success: boolean; message?: string }>(
      "/schedule/sync-from-ptit"
    );
  },
};

// Auth API
export const authApi = {
  // Base URL for auth endpoints
  baseUrl:
    import.meta.env.VITE_AUTH_URL || "https://api.learnsql.store/api/auth",

  // Login with correct endpoint and payload format
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${authApi.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
        remember: credentials.remember ?? true,
      }),
    });

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

    return data;
  },

  // QLDT/PTIT Login
  loginWithQLDT: async (credentials: {
    username: string;
    password: string;
  }): Promise<LoginResponse> => {
    const response = await fetch(`${authApi.baseUrl}/auth/ptit-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `QLDT login failed: ${response.status} ${response.statusText}`
      );
    }

    const data: LoginResponse = await response.json();

    if (data.status !== 1) {
      throw new Error("QLDT login failed: Invalid response status");
    }

    if (!data.accessToken || !data.refreshToken) {
      throw new Error("QLDT login failed: Missing tokens in response");
    }

    // Store tokens
    TokenManager.setTokens(data.accessToken, data.refreshToken);

    return data;
  },

  // Google OAuth Login
  loginWithGoogle: async (idToken: string): Promise<LoginResponse> => {
    const response = await fetch(`${authApi.baseUrl}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken: idToken,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Google login failed: ${response.status} ${response.statusText}`
      );
    }

    const data: LoginResponse = await response.json();

    if (data.status !== 1) {
      throw new Error("Google login failed: Invalid response status");
    }

    if (!data.accessToken || !data.refreshToken) {
      throw new Error("Google login failed: Missing tokens in response");
    }

    // Store tokens
    TokenManager.setTokens(data.accessToken, data.refreshToken);

    return data;
  },

  // Register new user (original method)
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await fetch(`${authApi.baseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userData.username,
        password: userData.password,
        fullName: userData.fullName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Registration failed: ${response.status} ${response.statusText}`
      );
    }

    const data: RegisterResponse = await response.json();

    if (data.status !== 1) {
      throw new Error(
        data.message || "Registration failed: Invalid response status"
      );
    }

    return data;
  },

  // Logout - clear tokens
  logout: async (): Promise<void> => {
    TokenManager.clearTokens();
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
  getCurrentUser: async (): Promise<unknown> => {
    // Call API to get current user info instead of parsing token
    return apiClient.get<unknown>("/users/info");
  },

  // Get user info (moved from userApi - uses auth domain)
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
    return apiAuth.get<{
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
    }>("/users/info");
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
  isAuthError: (error: unknown): boolean => {
    if (typeof error === "string") {
      return (
        error.toLowerCase().includes("authentication") ||
        error.toLowerCase().includes("unauthorized") ||
        error.toLowerCase().includes("token") ||
        error.toLowerCase().includes("login")
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
    ) {
      const message = (error as { message: string }).message.toLowerCase();
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
  formatErrorMessage: (error: unknown): string => {
    let message = "";

    if (typeof error === "string") {
      message = error;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
    ) {
      message = (error as { message: string }).message;
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
    user: {
      ...userApi,
      getUserInfo: authApi.getUserInfo, // Reference to auth getUserInfo
      getUserInfo2: authApi.getCurrentUser,
    },
    ranking: rankingApi,
    contest: contestApi,
    auth: authApi,
    schedule: scheduleApi,
    utils: apiUtils,
  };
};

export default {
  question: questionApi,
  user: userApi,
  ranking: rankingApi,
  contest: contestApi,
  auth: authApi,
  schedule: scheduleApi,
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
