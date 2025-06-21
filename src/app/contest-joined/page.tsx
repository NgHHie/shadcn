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
    if (contestId && userId) {
      loadData();
    }
  }, [contestId, userId]); // Thêm userId vào dependency

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

  // Data loading - FIX: Đảm bảo API complete được gọi
  const loadData = async () => {
    if (!contestId || !userId) return;

    try {
      setLoading(true);

      // Load contest data trước
      const contestResponse = await contestJoinedApi.getContestDetail(
        contestId
      );
      setContestData(contestResponse);

      // Sau đó load question statuses với data từ contest
      if (contestResponse.questions.length > 0) {
        const questionIds = contestResponse.questions.map((q) => q.id);
        const statusesResponse = await contestJoinedApi.checkQuestionStatus({
          questionIds,
          userId,
        });
        setQuestionStatuses(statusesResponse);
        console.log("Question statuses loaded:", statusesResponse); // Debug log
      }
    } catch (error) {
      console.error("Failed to load contest data:", error);
      toastError("Không thể tải thông tin cuộc thi");
      navigate("/contest");
    } finally {
      setLoading(false);
    }
  };

  // Hàm refresh để test
  const handleRefresh = async () => {
    await loadData();
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

  // Handle question click
  const handleQuestionClick = (questionId: string, questionCode: string) => {
    if (!isContestActive) {
      toastError("Cuộc thi chưa bắt đầu hoặc đã kết thúc");
      return;
    }
    navigate(`/question-detail/${questionId}?contest=${contestId}`);
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
    setCurrentPage(0); // Reset về trang đầu
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!contestData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải thông tin cuộc thi. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Contest Header */}
      <ContestJoinedHeader
        contest={contestData}
        timeRemaining={timeRemaining}
        isActive={isContestActive}
        onRefresh={handleRefresh}
      />

      {/* Contest Stats */}
      <ContestStats
        totalQuestions={totalQuestions}
        completedQuestions={
          questionStatuses.filter((s) => s.status === "AC").length
        }
        timeRemaining={timeRemaining}
        isActive={isContestActive}
      />

      {/* Questions List with Pagination */}
      <ContestQuestionsList
        questions={currentQuestions}
        getQuestionStatus={getQuestionStatus}
        onQuestionClick={handleQuestionClick}
        loading={loading}
        totalElements={totalQuestions}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
