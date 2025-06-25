// src/app/contest-editor/page.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { SalesAnalyticsDashboard } from "@/components/contest-editor/sales-analytics-dashboard";
import { SidebarPanel } from "@/components/contest-editor/sidebar-panel";
import { GlobalContestHeader } from "@/components/contest/global-contest-header";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuestionDetail, useApi } from "@/lib/api";
import { toastError } from "@/lib/toast";
import { contestApi, TrackerData } from "@/lib/apiContest";
import { useUserActionTracker } from "@/hooks/use-user-action-tracker";

interface EditorProps {
  question?: QuestionDetail | null;
}

export function ContestEditor({ question: propQuestion }: EditorProps) {
  // ⚠️ CRITICAL: ALL HOOKS MUST BE DECLARED FIRST - NO EXCEPTIONS!

  const { contestId, innerQuestionId } = useParams<{
    contestId: string;
    innerQuestionId: string;
    outerQuestionId: string;
  }>();
  const api = useApi();
  const isMobile = useIsMobile();

  // State hooks
  const [isTrackerEnabled, setIsTrackerEnabled] = useState(false);
  const [apiQuestion, setApiQuestion] = useState<QuestionDetail | null>(null);
  const [contestData, setContestData] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isContestActive, setIsContestActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(600);
  const [sidebarHeight, setSidebarHeight] = useState(300);
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // USER ACTION TRACKER - Sử dụng hook có sẵn với API từ apiContest.ts
  useUserActionTracker({
    contestId: contestId || "",
    enabled: isTrackerEnabled,
  });

  const startDragging = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Debounced resize function
  const debouncedResize = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (callback: () => void) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(callback, 16);
      };
    })(),
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      debouncedResize(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();

        if (isMobile) {
          const containerHeight = containerRect.height;
          const newHeight = e.clientY - containerRect.top;
          const minHeight = 200;
          const maxHeight = Math.min(600, containerHeight - 200);

          if (newHeight >= minHeight && newHeight <= maxHeight) {
            setSidebarHeight(newHeight);
          }
        } else {
          const containerWidth = containerRect.width;
          const newWidth = e.clientX - containerRect.left;
          const minWidth = 400;
          const maxWidth = Math.min(1000, containerWidth - 300);

          if (newWidth >= minWidth && newWidth <= maxWidth) {
            setSidebarWidth(newWidth);
          }
        }
      });
    },
    [isDragging, isMobile, debouncedResize]
  );

  // Timer logic
  const updateTimer = useCallback(() => {
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
  }, [contestData]);

  // Format time remaining helper
  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Effects
  useEffect(() => {
    const fetchContestAndQuestion = async () => {
      if (!contestId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch contest data with tracker info
        const contestResponse = await contestApi.getContestForEditor(contestId);
        setContestData(contestResponse.contest);
        setIsTrackerEnabled(contestResponse.isTrackerEnabled);

        // Fetch question if innerQuestionId exists
        if (innerQuestionId) {
          const questionData = await api.question.getQuestionDetail(
            innerQuestionId
          );
          setApiQuestion(questionData);
        }
      } catch (err: any) {
        const errorMessage = api.utils.formatErrorMessage(err);
        setError(errorMessage);
        toastError("Lỗi khi tải dữ liệu: " + errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchContestAndQuestion();
  }, [contestId, innerQuestionId]);

  // Timer effect
  useEffect(() => {
    if (!contestData) return;
    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, [contestData, updateTimer]);

  // Mouse event effects
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: true,
      });
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleResize = () => {
      debouncedResize(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();

        if (isMobile) {
          const maxHeight = containerRect.height - 200;
          if (sidebarHeight > maxHeight) {
            setSidebarHeight(Math.max(200, maxHeight));
          }
        } else {
          const maxWidth = containerRect.width - 300;
          if (sidebarWidth > maxWidth) {
            setSidebarWidth(Math.max(400, maxWidth));
          }
        }
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarWidth, sidebarHeight, isMobile, debouncedResize]);

  // Memoized values (after all hooks)
  const question = propQuestion || apiQuestion;

  const DragHandle = ({
    direction,
  }: {
    direction: "horizontal" | "vertical";
  }) => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className={`flex ${
          direction === "horizontal"
            ? "flex-col items-center justify-center space-y-1" // Thanh dọc -> dots dọc
            : "items-center justify-center space-x-1" // Thanh ngang -> dots ngang
        }`}
      >
        <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
        <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
        <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
      </div>
    </div>
  );

  // NOW it's safe to render conditionally - all hooks have been called
  if (isMobile) {
    return (
      <div className="flex flex-col">
        {/* Global Contest Header */}
        <GlobalContestHeader
          contest={contestData}
          timeRemaining={timeRemaining}
          isActive={isContestActive}
          showBackButton={true}
          showCompleteButton={false}
        />

        <div
          ref={containerRef}
          className="flex flex-col min-h-[calc(100vh-4rem)] bg-background rounded-lg border shadow-sm"
        >
          <div
            style={{
              height: `${sidebarHeight}px`,
              minHeight: `${sidebarHeight}px`,
            }}
            className="w-full overflow-hidden border-b"
          >
            <SidebarPanel
              question={question}
              loading={loading}
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>

          <div
            className={`relative h-3 w-full bg-muted hover:bg-primary/20 cursor-row-resize z-10 ${
              isDragging ? "bg-primary/30" : ""
            }`}
            onMouseDown={startDragging}
          >
            <DragHandle direction="vertical" />
          </div>

          <div className="flex-1 overflow-hidden">
            <SalesAnalyticsDashboard question={question} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Global Contest Header */}
      <GlobalContestHeader
        contest={contestData}
        timeRemaining={timeRemaining}
        isActive={isContestActive}
        showBackButton={true}
        showCompleteButton={false}
      />

      <div
        ref={containerRef}
        className="flex h-[calc(100vh-4rem)] bg-background rounded-lg border shadow-sm relative"
      >
        <div
          style={{
            width: `${sidebarWidth}px`,
            minWidth: `${sidebarWidth}px`,
          }}
          className="h-full overflow-hidden border-r flex-shrink-0"
        >
          <SidebarPanel
            question={question}
            loading={loading}
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>

        <div
          className={`relative w-3 h-full bg-muted hover:bg-primary/20 cursor-col-resize z-10 ${
            isDragging ? "bg-primary/30" : ""
          }`}
          onMouseDown={startDragging}
        >
          <DragHandle direction="horizontal" />
        </div>

        <div className="flex-1 overflow-hidden">
          <SalesAnalyticsDashboard question={question} />
        </div>
      </div>
    </div>
  );
}
