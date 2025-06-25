// src/hooks/use-contest-submission-history.tsx
import { useState, useEffect, useCallback } from "react";
import { toastError, toastSuccess } from "@/lib/toast";
import { useWebSocket } from "@/hooks/use-websocket";
import { SocketMessage } from "@/lib/websocket";
import { contestApi, ContestSubmissionRequest } from "@/lib/apiContest";
import { authApi } from "@/lib/api";

interface SubmissionHistoryItem {
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

interface QuestionInfo {
  code: string;
  title: string;
}

export const useContestSubmissionHistory = (
  questionId?: string,
  questionInfo?: QuestionInfo,
  onOpenHistory?: () => void,
  contestId?: string,
  outerQuestionId?: string
) => {
  const [submissions, setSubmissions] = useState<SubmissionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const handleSocketMessage = useCallback(
    (message: SocketMessage) => {
      console.log("Received contest socket message:", message);

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

        return updatedSubmissions;
      });
    },
    [onOpenHistory]
  );

  // Setup WebSocket connection
  const { isConnected } = useWebSocket({
    userId: userInfo?.id,
    onMessage: handleSocketMessage,
    autoConnect: true,
  });

  // Fetch user info - SỬ DỤNG API CÓ SẴN
  const fetchUserInfo = useCallback(async () => {
    try {
      const data = await authApi.getUserInfo();
      setUserInfo(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
    return null;
  }, []);

  // Fetch contest history - SỬ DỤNG API MỚI
  const fetchContestHistory = useCallback(async () => {
    if (!outerQuestionId) return;

    try {
      setLoading(true);

      const response = await contestApi.getSubmissionHistory({
        questionContestId: outerQuestionId,
        page: 0,
        size: 20,
      });

      setSubmissions(response.content || []);
    } catch (error) {
      toastError("Lỗi khi tải lịch sử submit");
    } finally {
      setLoading(false);
    }
  }, [outerQuestionId]);

  // Submit solution - SỬ DỤNG API MỚI
  const submitToAPI = useCallback(
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
        // Prepare contest submission payload
        const contestPayload: ContestSubmissionRequest = {
          questionId: payload.questionId,
          sql: payload.sql,
          typeDatabaseId: payload.typeDatabaseId,
          contestId: contestId,
          questionContestId: outerQuestionId,
        };

        const result = await contestApi.submitCode(contestPayload);

        // Add pending submission
        if (result.submitId && userInfo) {
          const pendingSubmission: SubmissionHistoryItem = {
            id: result.submitId,
            createdAt: result.timeSubmit,
            createdBy: userInfo.id,
            lastModifiedAt: result.timeSubmit,
            timeSubmit: result.timeSubmit,
            timeout: result.timeExec || 0,
            status: "PENDING",
            user: {
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              userCode: userInfo.userCode,
              fullName: userInfo.fullName,
            },
            testPass: 0,
            totalTest: 0,
            question: {
              questionCode: additionalInfo?.questionCode || "",
              title: additionalInfo?.questionTitle || "",
            },
            database: {
              id: payload.typeDatabaseId,
              name: additionalInfo?.databaseName || "Unknown",
            },
          };

          setSubmissions((prev) => [pendingSubmission, ...prev]);
        }

        return result;
      } catch (error) {
        toastError("Lỗi khi submit");
        throw error;
      }
    },
    [userInfo, contestId, outerQuestionId]
  );

  // Initialize
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    if (userInfo && outerQuestionId) {
      fetchContestHistory();
    }
  }, [userInfo, outerQuestionId, fetchContestHistory]);

  return {
    submissions,
    loading,
    userInfo,
    submitToAPI,
    isConnected,
  };
};
