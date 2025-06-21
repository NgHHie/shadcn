// src/app/contest-joined/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserContext } from "@/contexts/UserContext";
import { toastError } from "@/lib/toast";
import { contestJoinedApi } from "@/lib/api";

import {
  ContestJoinedDetail,
  ContestQuestionStatus,
} from "@/types/contest-joined";

// Components
import { ContestJoinedHeader } from "@/components/contest/contest-joined-header";
import { ContestStats } from "@/components/contest/contest-stats";
import { ContestQuestionsList } from "@/components/contest/contest-questions-list";

export function ContestJoinedPage() {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
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
    if (contestId) loadData();
  }, [contestId]);

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

  // Data loading
  const loadData = async () => {
    await Promise.all([loadContestData(), loadQuestionStatuses()]);
  };

  const loadContestData = async () => {
    if (!contestId) return;

    try {
      setLoading(true);
      const data = await contestJoinedApi.getContestDetail(contestId);
      setContestData(data);
    } catch (error) {
      console.error("Failed to load contest data:", error);
      toastError("Không thể tải thông tin cuộc thi");
      navigate("/contest");
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionStatuses = async () => {
    if (!contestId || !userId) return;

    try {
      const contestData = await contestJoinedApi.getContestDetail(contestId);
      const questionIds = contestData.questions.map((q) => q.id);
      const statuses = await contestJoinedApi.checkQuestionStatus({
        questionIds,
        userId,
      });
      setQuestionStatuses(statuses);
    } catch (error) {
      console.error("Failed to load question statuses:", error);
    }
  };

  // Helper functions
  const formatTimeRemaining = (milliseconds: number): string => {
    const total = Math.max(0, milliseconds);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((total % (1000 * 60)) / 1000);

    if (days > 0) return `${days} ngày ${hours} giờ ${minutes} phút`;
    if (hours > 0) return `${hours} giờ ${minutes} phút ${seconds} giây`;
    if (minutes > 0) return `${minutes} phút ${seconds} giây`;
    return `${seconds} giây`;
  };

  const getQuestionStatus = (questionId: string): "AC" | "PENDING" => {
    const status = questionStatuses.find((s) => s.questionId === questionId);
    return status?.status === "AC" ? "AC" : "PENDING";
  };

  const getPaginatedQuestions = () => {
    if (!contestData) return [];
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return contestData.questions.slice(startIndex, endIndex);
  };

  const getStats = () => {
    if (!contestData)
      return { completed: 0, total: 0, points: 0, totalPoints: 0 };

    const completed = questionStatuses.filter((s) => s.status === "AC").length;
    const total = contestData.questions.length;
    const totalPoints = contestData.questions.reduce(
      (sum, q) => sum + q.point,
      0
    );
    const points = questionStatuses
      .filter((s) => s.status === "AC")
      .reduce((sum, s) => {
        const question = contestData.questions.find(
          (q) => q.id === s.questionId
        );
        return sum + (question?.point || 0);
      }, 0);

    return { completed, total, points, totalPoints };
  };

  // Event handlers
  const handleQuestionClick = (questionId: string, questionCode: string) => {
    if (!isContestActive) {
      toastError("Không thể làm bài", {
        description: "Cuộc thi chưa bắt đầu hoặc đã kết thúc",
      });
      return;
    }

    navigate(`/question-detail/${questionId}`, {
      state: { contestMode: true, contestId, questionCode },
    });
  };

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0);
  };
  const handleBack = () => navigate("/contest");

  // Render states
  if (loading) {
    return (
      <div className="flex flex-col gap-2 py-2 md:gap-3 md:py-3">
        <div className="px-4 lg:px-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contestData) {
    return (
      <div className="flex flex-col gap-2 py-2 md:gap-3 md:py-3">
        <div className="px-4 lg:px-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Không tìm thấy thông tin cuộc thi. Vui lòng quay lại danh sách
              cuộc thi.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Main render
  const stats = getStats();
  const totalElements = contestData.questions.length;
  const totalPages = Math.ceil(totalElements / pageSize);

  return (
    <div className="flex flex-col gap-2 py-2 md:gap-3 md:py-3">
      <div className="px-4 lg:px-6">
        <ContestJoinedHeader
          contestName={contestData.name}
          contestCode={contestData.contestCode}
          onBack={handleBack}
          onRefresh={loadData}
        />

        <ContestStats
          timeRemaining={timeRemaining}
          completed={stats.completed}
          total={stats.total}
          points={stats.points}
          totalPoints={stats.totalPoints}
        />

        <ContestQuestionsList
          questions={getPaginatedQuestions()}
          getQuestionStatus={getQuestionStatus}
          onQuestionClick={handleQuestionClick}
          loading={loading}
          totalElements={totalElements}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
