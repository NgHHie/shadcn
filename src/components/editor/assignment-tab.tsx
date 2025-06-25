// src/components/editor/assignment-tab.tsx
"use client";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuestionDetail } from "@/lib/api";
import { QuestionSelector } from "./question-selector";

interface AssignmentTabProps {
  question?: QuestionDetail | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onQuestionChange?: (questionId: string) => void;
}

export function AssignmentTab({
  question,
  loading,
  error,
  onRetry,
  onQuestionChange,
}: AssignmentTabProps) {
  const { t } = useTranslation("editor");
  // Memoize color functions to prevent recalculation
  const getTypeColor = (type: string) => {
    switch (type) {
      case "SELECT":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
      case "INSERT":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
      case "UPDATE":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
      case "DELETE":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      case "CREATE":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200";
      case "PROCEDURE":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200";
      case "INDEX":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-green-600 dark:text-green-400";
      case "MEDIUM":
        return "text-yellow-600 dark:text-yellow-400";
      case "HARD":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  // Memoize parsed HTML content to prevent re-parsing
  const parsedContent = useMemo(() => {
    if (!question?.content) {
      return `Vui lòng chọn một câu hỏi từ danh sách để bắt đầu luyện tập SQL.

Bạn có thể:
• Xem đề bài chi tiết
• Viết và chạy thử SQL
• Nộp bài để kiểm tra kết quả
• Trao đổi với cộng đồng
• Nhận hỗ trợ từ AI Assistant`;
    }

    return question.content; // Return raw HTML content
  }, [question?.content]);

  // Function to render HTML content safely
  const renderHTMLContent = (htmlContent: string) => {
    // Decode Unicode characters
    const decodedContent = htmlContent.replace(/\\u([0-9A-Fa-f]{4})/g, (code) =>
      String.fromCharCode(parseInt(code, 16))
    );

    return (
      <div
        className="prose-question-content"
        dangerouslySetInnerHTML={{ __html: decodedContent }}
      />
    );
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "EASY":
        return t("assignment.difficulty.easy");
      case "MEDIUM":
        return t("assignment.difficulty.medium");
      case "HARD":
        return t("assignment.difficulty.hard");
      default:
        return level.charAt(0) + level.slice(1).toLowerCase();
    }
  };

  // Memoize question metadata
  const questionMetadata = useMemo(() => {
    if (!question) return null;

    return (
      <div className="flex items-center gap-2 mb-3">
        <Badge
          variant="outline"
          className={`text-xs px-2 py-1 font-medium ${getTypeColor(
            question.type
          )} border-0`}
        >
          {question.type}
        </Badge>
        <span
          className={`text-sm font-medium ${getDifficultyColor(
            question.level
          )}`}
        >
          {getLevelText(question.level)}
        </span>
        <span className="text-sm text-muted-foreground">
          {question.point} {t("assignment.points")}
        </span>
      </div>
    );
  }, [question]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          // Loading state
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {t("assignment.loading")}
              </p>
            </div>
          </div>
        ) : error ? (
          // Error state
          <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
            <Alert className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            {onRetry && (
              <Button onClick={onRetry} size="sm">
                {t("assignment.retry")}
              </Button>
            )}
          </div>
        ) : (
          // Normal content
          <div className="space-y-4">
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <h3 className="font-medium text-lg text-foreground">
                    {question?.questionCode || "SQL Editor"}:{" "}
                    {question?.title || "Chọn câu hỏi để bắt đầu"}
                  </h3>
                </div>

                {/* Question metadata */}
                {questionMetadata}
              </div>
            </div>

            {/* Question description */}
            <div className="prose prose-sm max-w-none [&_ul]:pl-6 [&_li]:ml-2">
              {question?.content ? (
                renderHTMLContent(parsedContent)
              ) : (
                <div className="text-sm mb-4 text-foreground whitespace-pre-line leading-relaxed">
                  {parsedContent}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
