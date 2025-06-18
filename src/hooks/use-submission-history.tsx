// src/hooks/use-submission-history.tsx
import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/lib/api";
import { useWebSocket } from "@/hooks/use-websocket";
import { SocketMessage } from "@/lib/websocket";
import { toastError, toastSuccess } from "@/lib/toast";
import { handleDataFetchError } from "@/lib/error-handler";

export interface SubmissionHistoryItem {
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
}

export interface SubmissionHistoryResponse {
  content: SubmissionHistoryItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface UserInfo {
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
}

interface QuestionInfo {
  code: string;
  title: string;
}

export const useSubmissionHistory = (
  questionId?: string,
  questionInfo?: QuestionInfo,
  onOpenHistory?: () => void
) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const api = useApi();
  const pageSize = 10;

  // Handle WebSocket messages for real-time updates
  const handleSocketMessage = useCallback((message: SocketMessage) => {
    console.log("Received socket message:", message);

    setSubmissions((prevSubmissions) => {
      const updatedSubmissions = prevSubmissions.map((submission) => {
        if (submission.id === message.submitId) {
          return {
            ...submission,
            status: message.statusSubmit,
            timeout: message.timeExec,
            testPass: message.testPass,
            totalTest: message.totalTest,
          };
        }
        return submission;
      });

      // Check if any submission was updated
      const wasUpdated = updatedSubmissions.some(
        (submission, index) => submission !== prevSubmissions[index]
      );

      if (wasUpdated) {
        // Show success toast for accepted solutions
        if (message.statusSubmit === "AC") {
          toastSuccess("🎉 Accepted!", {
            description: `Test passed: ${message.testPass}/${message.totalTest} | Time: ${message.timeExec}ms`,
            action: onOpenHistory
              ? {
                  label: "Xem History",
                  onClick: onOpenHistory,
                }
              : undefined,
          });
        } else {
          toastError("Rejected!", {
            description: `Test passed: ${message.testPass}/${message.totalTest} | Time: ${message.timeExec}ms`,
            action: onOpenHistory
              ? {
                  label: "Xem History",
                  onClick: onOpenHistory,
                }
              : undefined,
          });
        }
      }

      return updatedSubmissions;
    });
  }, []);

  // Setup WebSocket connection
  const { isConnected } = useWebSocket({
    userId: userInfo?.id,
    onMessage: handleSocketMessage,
    autoConnect: true,
  });

  // Fetch user info
  const fetchUserInfo = useCallback(async () => {
    try {
      // Use the API client instead of hard-coded fetch
      const userData: UserInfo = await api.user.getUserInfo();
      setUserInfo(userData);
      return userData;
    } catch (err: unknown) {
      const errorMessage = handleDataFetchError(err);
      setError(errorMessage);
      // toastError("Lỗi khi tải thông tin người dùng", {
      //   description: errorMessage,
      // });
      throw err;
    }
  }, []);

  // Fetch submission history
  const fetchSubmissionHistory = useCallback(
    async (userId: string, page: number = 0, targetQuestionId?: string) => {
      try {
        setLoading(true);
        setError(null);

        const url = new URL(
          `https://api.learnsql.store/api/app/submit-history/user/${userId}`
        );
        url.searchParams.append("page", page.toString());
        url.searchParams.append("size", pageSize.toString());

        if (targetQuestionId) {
          url.searchParams.append("questionId", targetQuestionId);
        }

        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${localStorage
              .getItem("access_token")
              ?.replace(/"/g, "")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: SubmissionHistoryResponse = await response.json();

        setSubmissions(data.content);
        setCurrentPage(data.number);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);

        return data;
      } catch (err: unknown) {
        const errorMessage = handleDataFetchError(err);
        setError(errorMessage);
        toastError("Lỗi khi tải lịch sử submit", {
          description: errorMessage,
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Submit solution
  const submitSolution = useCallback(
    async (
      payload: {
        questionId: string;
        sql: string;
        typeDatabaseId: string;
      },
      additionalInfo?: {
        databaseName: string;
        questionCode?: string;
        questionTitle?: string;
      }
    ) => {
      try {
        const response = await fetch(
          "https://api.learnsql.store/api/app/executor/submit",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage
                .getItem("access_token")
                ?.replace(/"/g, "")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Add pending submission to the list immediately với đầy đủ thông tin
        if (result.submitId && userInfo) {
          const pendingSubmission: SubmissionHistoryItem = {
            id: result.submitId,
            createdAt: result.timeSubmit,
            createdBy: userInfo.id,
            lastModifiedAt: result.timeSubmit,
            timeSubmit: result.timeSubmit,
            timeout: result.timeExec,
            status: "PENDING",
            user: {
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              userCode: userInfo.userCode,
              fullName: userInfo.fullName,
            },
            testPass: result.testPass,
            totalTest: result.totalTest,
            question: {
              questionCode:
                additionalInfo?.questionCode || questionInfo?.code || "",
              title: additionalInfo?.questionTitle || questionInfo?.title || "",
            },
            database: {
              id: payload.typeDatabaseId,
              name: additionalInfo?.databaseName || "Unknown",
            },
          };

          setSubmissions((prev) => [
            pendingSubmission,
            ...prev.slice(0, pageSize - 1),
          ]);
        }

        return result;
      } catch (err: unknown) {
        const errorMessage = handleDataFetchError(err);
        toastError("Lỗi khi submit", {
          description: errorMessage,
        });
        throw err;
      }
    },
    [userInfo, pageSize, questionInfo]
  );

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await fetchUserInfo();
        if (userData && questionId) {
          await fetchSubmissionHistory(userData.id, 0, questionId);
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };

    loadData();
  }, [questionId, fetchUserInfo, fetchSubmissionHistory]);

  // Refresh function
  const refresh = useCallback(async () => {
    if (userInfo) {
      await fetchSubmissionHistory(userInfo.id, currentPage, questionId);
    }
  }, [userInfo, currentPage, questionId, fetchSubmissionHistory]);

  // Load specific page
  const loadPage = useCallback(
    async (page: number) => {
      if (userInfo) {
        await fetchSubmissionHistory(userInfo.id, page, questionId);
      }
    },
    [userInfo, questionId, fetchSubmissionHistory]
  );

  return {
    userInfo,
    submissions,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    isWebSocketConnected: isConnected,
    submitSolution,
    refresh,
    loadPage,
  };
};
