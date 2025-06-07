// src/lib/api.ts
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

export interface QuestionListItem {
  id: string;
  questionCode: string;
  title: string;
  type: string;
  level: string;
  point: number;
  enable: boolean;
  status?: "AC" | "WA" | "TLE" | "Not Started";
}

// HTTP Client with error handling
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (!isPublicEndpoint(endpoint)) {
      let token = localStorage.getItem("access_token");

      if (token) {
        if (token.startsWith('"') && token.endsWith('"')) {
          token = token.slice(1, -1);
        }

        if (token.trim()) {
          defaultOptions.headers = {
            ...defaultOptions.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      }
    }
    try {
      const response = await fetch(url, defaultOptions);

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
  // Login
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<{
    token: string;
    user: UserProfile;
    expiresIn: number;
  }> => {
    const response = await apiClient.post<{
      token: string;
      user: UserProfile;
      expiresIn: number;
    }>("/auth/login", credentials);

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem("access_token", response.token);
    }

    return response;
  },

  // Register
  register: async (userData: {
    email: string;
    password: string;
    fullName: string;
    username: string;
  }): Promise<{
    token: string;
    user: UserProfile;
  }> => {
    return apiClient.post("/auth/register", userData);
  },

  // Logout
  logout: async (): Promise<void> => {
    localStorage.removeItem("access_token");
    await apiClient.post("/auth/logout");
  },

  // Refresh token
  refreshToken: async (): Promise<{ token: string; expiresIn: number }> => {
    return apiClient.post("/auth/refresh");
  },
};

// Utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("access_token");
  },

  // Get stored auth token
  getAuthToken: (): string | null => {
    return localStorage.getItem("access_token");
  },

  // Clear auth data
  clearAuthData: (): void => {
    localStorage.removeItem("access_token");
  },

  // Format error message
  formatErrorMessage: (error: any): string => {
    if (typeof error === "string") return error;
    if (error.message) return error.message;
    return "An unexpected error occurred";
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
