// src/hooks/use-contest-submission-history.tsx
import { useState, useEffect, useCallback } from "react";
import { toastError } from "@/lib/toast";

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

  // Fetch user info
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await fetch(
        "https://api.learnsql.store/api/app/user/info",
        {
          headers: {
            Authorization: `Bearer ${localStorage
              .getItem("access_token")
              ?.replace(/"/g, "")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
        return data;
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
    return null;
  }, []);

  // Fetch contest history
  const fetchContestHistory = useCallback(async () => {
    if (!outerQuestionId) return;

    try {
      setLoading(true);

      const url = new URL(
        "https://api.learnsql.store/api/app/submit-contest/user"
      );
      url.searchParams.append("questionContestId", outerQuestionId);
      url.searchParams.append("page", "0");
      url.searchParams.append("size", "20");

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${localStorage
            .getItem("access_token")
            ?.replace(/"/g, "")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.content || []);
      }
    } catch (error) {
      toastError("Lỗi khi tải lịch sử submit");
    } finally {
      setLoading(false);
    }
  }, [outerQuestionId]);

  // Submit solution
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

        if (response.ok) {
          const result = await response.json();

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
        }
        throw new Error("Submit failed");
      } catch (error) {
        toastError("Lỗi khi submit");
        throw error;
      }
    },
    [userInfo]
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
    isConnected: true,
  };
};
