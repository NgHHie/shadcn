// src/app/contest-joined/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserContext } from "@/contexts/UserContext";
import { toastError } from "@/lib/toast";
import { contestJoinedApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";

import {
  ContestJoinedDetail,
  ContestQuestionStatus,
} from "@/types/contest-joined";

// Components
import { ContestQuestionsList } from "@/components/contest/contest-questions-list";
import { GlobalContestHeader } from "@/components/contest/global-contest-header";

export function ContestJoinedPage() {
  const navigate = useNavigate();
  const { contestId } = useParams<{ contestId: string }>();
  const { userId } = useUserContext();

  // Main states
  const [contestData, setContestData] = useState<ContestJoinedDetail | null>(
    null
  );
  const [questionStatuses, setQuestionStatuses] = useState<
    ContestQuestionStatus[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isContestActive, setIsContestActive] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Effects
  useEffect(() => {
    if (contestId && userId) {
      loadData();
    }
  }, [contestId, userId]);

  useEffect(() => {
    if (!contestData) return;
    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, [contestData]);

  // Timer logic
  const updateTimer = () => {
    if (!contestData) return;

    const now = new Date();
    const startTime = new Date(contestData.startDatetime);
    const endTime = new Date(contestData.endDatetime);

    if (now >= startTime && now <= endTime) {
      setIsContestActive(true);
      const remaining = endTime.getTime() - now.getTime();
      setTimeRemaining(formatTimeRemaining(remaining));
    } else if (now < startTime) {
      setIsContestActive(false);
      const remaining = startTime.getTime() - now.getTime();
      setTimeRemaining(`Bắt đầu sau: ${formatTimeRemaining(remaining)}`);
    } else {
      setIsContestActive(false);
      setTimeRemaining("Cuộc thi đã kết thúc");
    }
  };

  // Format time remaining helper
  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Data loading
  const loadData = async () => {
    if (!contestId || !userId) return;

    try {
      setLoading(true);

      // Load contest data
      const contestResponse = await contestJoinedApi.getContestDetail(
        contestId
      );
      setContestData(contestResponse);

      // Load question statuses
      if (contestResponse.questions.length > 0) {
        const questionIds = contestResponse.questions.map((q) => q.id);
        const statusResponse = await contestJoinedApi.checkQuestionStatus({
          questionIds,
          userId,
        });
        setQuestionStatuses(statusResponse);
      }
    } catch (error) {
      console.error("Failed to load contest data:", error);
      toastError("Không thể tải thông tin cuộc thi");
    } finally {
      setLoading(false);
    }
  };

  // Get question status - now supports WA, CE, LTE, RTE
  const getQuestionStatus = (
    questionId: string
  ): "AC" | "WA" | "CE" | "LTE" | "RTE" | "PENDING" => {
    const status = questionStatuses.find((s) => s.questionId === questionId);
    return status?.status === "AC"
      ? "AC"
      : status?.status === "WA"
      ? "WA"
      : status?.status === "CE"
      ? "CE"
      : status?.status === "LTE"
      ? "LTE"
      : status?.status === "RTE"
      ? "RTE"
      : "PENDING";
  };

  // Handle question click
  const handleQuestionClick = (
    innerQuestionId: string,
    questionCode: string
  ) => {
    if (!isContestActive) {
      toastError("Cuộc thi chưa bắt đầu hoặc đã kết thúc");
      return;
    }

    // Tìm outerQuestionId từ danh sách questions
    const questionData = contestData?.questions.find(
      (q) => q.question.id === innerQuestionId
    );

    if (questionData) {
      // Điều hướng với format URL mới: /contest-joined/:contestId/question/:innerQuestionId/:outerQuestionId
      navigate(
        `/contest-joined/${contestId}/question/${innerQuestionId}/${questionData.id}`
      );
    } else {
      toastError("Không tìm thấy thông tin câu hỏi");
    }
  };

  // Pagination logic
  const totalQuestions = contestData?.questions.length || 0;
  const totalPages = Math.ceil(totalQuestions / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalQuestions);
  const currentQuestions =
    contestData?.questions.slice(startIndex, endIndex) || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Global Contest Header */}
        <GlobalContestHeader showBackButton={true} showCompleteButton={true} />

        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!contestData) {
    return (
      <div className="min-h-screen bg-background">
        {/* Global Contest Header */}
        <GlobalContestHeader showBackButton={true} showCompleteButton={true} />

        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Không thể tải thông tin cuộc thi. Vui lòng thử lại sau.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Global Contest Header - Full Width */}
      <GlobalContestHeader
        contest={contestData}
        timeRemaining={timeRemaining}
        isActive={isContestActive}
        showBackButton={false}
        showCompleteButton={true}
      />

      {/* Main Content - Contained */}
      <div className="container mx-auto px-6 py-6 max-w-6xl">
        <div className="space-y-6">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              Danh sách câu hỏi
            </h2>
            <span className="text-muted-foreground">
              {totalQuestions} câu hỏi
            </span>
          </div>

          {/* Questions List */}
          <ContestQuestionsList
            questions={currentQuestions}
            getQuestionStatus={getQuestionStatus}
            onQuestionClick={(questionId, questionCode) => {
              // questionId ở đây là question.question.id (innerQuestionId)
              // questionCode là question.question.questionCode
              handleQuestionClick(questionId, questionCode);
            }}
            loading={loading}
            totalElements={totalQuestions}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>
    </div>
  );
}
