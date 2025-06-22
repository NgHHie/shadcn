// src/components/dashboard/question-card.tsx - Mobile optimized version
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface QuestionCardProps {
  question: {
    id: string;
    questionCode: string;
    title: string;
    type: string;
    level: string;
    point: number;
    totalSub: number;
    status?: "AC" | "WA" | "TLE" | "CE" | "RTE" | "Not Started";
  };
  onClick: (questionId: string, questionTitle: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onClick,
}) => {
  const { t } = useTranslation('dashboard');
  const getStatusBorderColor = (status?: string) => {
    switch (status) {
      case "AC":
        return "border-l-green-500";
      case "WA":
      case "TLE":
      case "CE":
      case "RTE":
        return "border-l-red-500";
      default:
        return "border-l-primary";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "AC":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
      case "WA":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      case "TLE":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
      case "CE":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
  };

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
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
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

  const getStatusText = (status?: string) => {
    switch (status) {
      case "AC":
        return t("questionCard.accepted");
      case "WA":
        return t("questionCard.wrongAnswer");
      case "TLE":
        return t("questionCard.timeLimit");
      case "CE":
        return t("questionCard.compileError");
      default:
        return t("questionCard.notStarted");
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-md hover:scale-[1.01] border-2 border-l-4 ${getStatusBorderColor(
        question.status
      )}`}
    >
      <CardContent className="p-1.5 sm:p-2">
        {/* Desktop layout */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center">
          {/* Cột 1: Mã câu hỏi */}
          <div className="col-span-1 flex-shrink-0 min-w-0">
            <div className="text-xs font-mono font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-center border border-gray-200 dark:border-gray-700">
              {question.questionCode}
            </div>
          </div>

          {/* Cột 2: Tên đề bài + Loại ở cuối dòng */}
          <div className="col-span-7 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3
                className="font-medium text-sm line-clamp-1 leading-tight hover:underline decoration-1 underline-offset-2 transition-all duration-200 flex-1 min-w-0 cursor-pointer text-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(question.id, question.title);
                }}
              >
                {question.title}
              </h3>
              <Badge
                variant="outline"
                className={`text-[10px] border-0 px-1 py-0 h-4 flex-shrink-0 ${getTypeColor(
                  question.type
                )}`}
              >
                {question.type}
              </Badge>
            </div>
          </div>

          {/* Cột 3: Mức độ + Điểm */}
          <div className="col-span-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`font-medium ${getLevelColor(question.level)}`}>
                {question.level.charAt(0) +
                  question.level.slice(1).toLowerCase()}
              </span>
              <span className="text-muted-foreground">
                <span className="hidden sm:inline">{question.point} {t("questionCard.points")}</span>
                <span className="sm:hidden">{question.point}đ</span>
              </span>
            </div>
          </div>

          {/* Cột 4: Status */}
          <div className="col-span-1 flex justify-center">
            {question.status && (
              <Badge
                variant="outline"
                className={`text-[10px] border-0 px-2 py-1 h-fit max-w-[80px] whitespace-nowrap overflow-hidden text-ellipsis ${getStatusColor(
                  question.status
                )}`}
              >
                <span className="hidden sm:inline truncate">
                  {getStatusText(question.status)}
                </span>
                <span className="sm:hidden truncate">
                  {question.status === "Not Started" ? "New" : question.status}
                </span>
              </Badge>
            )}
          </div>

          {/* Cột 5: Số submits */}
          <div className="col-span-1 text-right">
            <span className="text-[11px] text-muted-foreground">
              <span className="hidden sm:inline">{question.totalSub} {t("questionCard.submissions")}</span>
              <span className="sm:hidden">{question.totalSub}</span>
            </span>
          </div>
        </div>

        {/* Mobile layout - chỉ hiển thị: mã (span 2), đề bài, mức độ */}
        <div className="sm:hidden grid grid-cols-12 gap-2 items-center">
          {/* Mã câu hỏi - span 2, cỡ chữ nhỏ hơn */}
          <div className="col-span-2 flex-shrink-0">
            <div className="text-[10px] font-mono font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-center border border-gray-200 dark:border-gray-700">
              {question.questionCode}
            </div>
          </div>

          {/* Đề bài - 1 dòng với ... */}
          <div className="col-span-8 min-w-0">
            <h3
              className="font-medium text-sm line-clamp-1 leading-tight hover:underline decoration-1 underline-offset-2 transition-all duration-200 cursor-pointer text-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onClick(question.id, question.title);
              }}
            >
              {question.title}
            </h3>
          </div>

          {/* Chỉ mức độ */}
          <div className="col-span-2 flex justify-end">
            <span
              className={`text-xs font-medium ${getLevelColor(question.level)}`}
            >
              {question.level.charAt(0) + question.level.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
