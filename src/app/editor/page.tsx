// src/app/editor/page.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SalesAnalyticsDashboard } from "@/components/editor/sales-analytics-dashboard";
import { SidebarPanel } from "@/components/editor/sidebar-panel";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuestionDetail, useApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toastError } from "@/lib/toast";

interface EditorProps {
  question?: QuestionDetail | null;
}

export function Editor({ question: propQuestion }: EditorProps) {
  // ⚠️ CRITICAL: ALL HOOKS MUST BE DECLARED FIRST - NO EXCEPTIONS!
  const { questionId } = useParams<{ questionId?: string }>();
  const navigate = useNavigate();
  const api = useApi();
  const isMobile = useIsMobile();

  // State hooks
  const [apiQuestion, setApiQuestion] = useState<QuestionDetail | null>(null);
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
      if (!questionId) {
        setApiQuestion(null);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const questionData = await api.question.getQuestionDetail(questionId);
        setApiQuestion(questionData);
      } catch (err: any) {
        const errorMessage = api.utils.formatErrorMessage(err);
        setError(errorMessage);
        toastError("Lỗi khi tải đề bài: " + errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]); // Only depend on questionId

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
        className={`${
          direction === "horizontal" ? "h-0.5 w-8" : "w-0.5 h-8"
        } flex ${
          direction === "horizontal"
            ? "items-center justify-center space-x-1"
            : "flex-col items-center justify-center space-y-1"
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
            } transition-colors flex-shrink-0`}
            onMouseDown={startDragging}
          >
            <DragHandle direction="horizontal" />
          </div>

          <div className="flex-1 min-h-0">
            <SalesAnalyticsDashboard question={question} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div
        ref={containerRef}
        className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background rounded-lg border shadow-sm"
      >
        <div
          style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
          className="h-full overflow-hidden border-r"
        >
          <SidebarPanel
            question={question}
            loading={loading}
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>

        <div
          className={`relative w-3 bg-muted hover:bg-primary/20 cursor-col-resize z-10 ${
            isDragging ? "bg-primary/30" : ""
          } transition-colors flex-shrink-0`}
          onMouseDown={startDragging}
        >
          <DragHandle direction="vertical" />
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <SalesAnalyticsDashboard question={question} />
        </div>
      </div>
    </div>
  );
}
