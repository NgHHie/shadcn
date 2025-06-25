// src/app/contest-editor/page.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ContestCodeEditor } from "@/components/contest-editor/contest-code-editor";
import { ContestSidebar } from "@/components/contest-editor/contest-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuestionDetail, useApi } from "@/lib/api";
import { toastError } from "@/lib/toast";

export function ContestEditor() {
  // Get params from URL
  const { contestId, innerQuestionId, outerQuestionId } = useParams<{
    contestId: string;
    innerQuestionId: string;
    outerQuestionId: string;
  }>();

  const api = useApi();
  const isMobile = useIsMobile();

  // State hooks
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(600);
  const [sidebarHeight, setSidebarHeight] = useState(300);
  const [isDragging, setIsDragging] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Effects
  useEffect(() => {
    const fetchQuestion = async () => {
      if (!innerQuestionId) {
        setQuestion(null);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Sử dụng innerQuestionId để lấy chi tiết câu hỏi
        const questionData = await api.question.getQuestionDetail(
          innerQuestionId
        );
        setQuestion(questionData);
      } catch (err: any) {
        const errorMessage = api.utils.formatErrorMessage(err);
        setError(errorMessage);
        toastError("Lỗi khi tải đề bài: " + errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [innerQuestionId]);

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

  const DragHandle = ({
    direction,
  }: {
    direction: "horizontal" | "vertical";
  }) => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className={`${
          direction === "horizontal"
            ? "w-1 h-16 cursor-col-resize"
            : "h-1 w-16 cursor-row-resize"
        } bg-border hover:bg-border/80 transition-colors rounded-full`}
      />
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-hidden bg-background"
    >
      {isMobile ? (
        // Mobile Layout - Vertical Split
        <div className="flex flex-col h-full">
          {/* Code Editor */}
          <div style={{ height: `${sidebarHeight}px` }} className="relative">
            <ContestCodeEditor
              question={question}
              loading={loading}
              error={error}
              onRetry={() => window.location.reload()}
              contestId={contestId!}
              outerQuestionId={outerQuestionId!}
            />
          </div>

          {/* Drag Handle */}
          <div
            className="relative h-2 bg-muted cursor-row-resize flex-shrink-0 hover:bg-muted/80 transition-colors"
            onMouseDown={startDragging}
          >
            <DragHandle direction="vertical" />
          </div>

          {/* Sidebar */}
          <div className="flex-1 overflow-hidden">
            <ContestSidebar
              question={question}
              loading={loading}
              error={error}
              onRetry={() => window.location.reload()}
              contestId={contestId!}
              outerQuestionId={outerQuestionId!}
            />
          </div>
        </div>
      ) : (
        // Desktop Layout - Horizontal Split
        <div className="flex h-full">
          {/* Code Editor */}
          <div style={{ width: `${sidebarWidth}px` }} className="relative">
            <ContestCodeEditor
              question={question}
              loading={loading}
              error={error}
              onRetry={() => window.location.reload()}
              contestId={contestId!}
              outerQuestionId={outerQuestionId!}
            />
          </div>

          {/* Drag Handle */}
          <div
            className="relative w-2 bg-muted cursor-col-resize flex-shrink-0 hover:bg-muted/80 transition-colors"
            onMouseDown={startDragging}
          >
            <DragHandle direction="horizontal" />
          </div>

          {/* Sidebar */}
          <div className="flex-1 overflow-hidden">
            <ContestSidebar
              question={question}
              loading={loading}
              error={error}
              onRetry={() => window.location.reload()}
              contestId={contestId!}
              outerQuestionId={outerQuestionId!}
            />
          </div>
        </div>
      )}
    </div>
  );
}
