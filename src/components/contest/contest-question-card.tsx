// src/components/contest/contest-question-card.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface QuestionCardProps {
  question: {
    id: string;
    questionCode: string;
    title: string;
    type: string;
    level: string;
    point: number;
    totalSub: number;
    status?: "AC" | "WA" | "CE" | "LTE" | "RTE" | "PENDING";
  };
  onClick: (questionId: string, questionTitle: string) => void;
}

export const ContestQuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onClick,
}) => {
  const getStatusBorderColor = (status?: string) => {
    switch (status) {
      case "AC":
        return "border-l-green-500";
      case "WA":
      case "CE":
      case "LTE":
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
      case "CE":
      case "LTE":
      case "RTE":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";

      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "AC":
        return "Accepted";
      case "WA":
        return "Wrong Answer";
      case "CE":
        return "Compile Error";
      case "LTE":
        return "Time Limit";
      case "RTE":
        return "Runtime Error";
      default:
        return "Chưa làm";
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-md hover:scale-[1.01] border-2 border-l-4 cursor-pointer ${getStatusBorderColor(
        question.status
      )}`}
      onClick={() => onClick(question.id, question.title)}
    >
      <CardContent className="p-1.5 sm:p-2">
        {/* Desktop layout */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center">
          {/* Cột 2: Tên đề bài + Loại ở cuối dòng */}
          <div className="col-span-10 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium text-sm line-clamp-1 leading-tight hover:underline decoration-1 underline-offset-2 transition-all duration-200 flex-1 min-w-0 cursor-pointer text-foreground hover:text-primary">
                {question.title}
              </h3>
            </div>
          </div>

          {/* Cột 4: Status */}
          <div className="col-span-2 flex justify-center">
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
                  {question.status === "PENDING" ? "New" : question.status}
                </span>
              </Badge>
            )}
          </div>
        </div>

        {/* Mobile layout */}
        <div className="sm:hidden grid grid-cols-12 gap-2 items-center">
          {/* Mã câu hỏi */}
          <div className="col-span-2 flex-shrink-0">
            <div className="text-[10px] font-mono font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-center border border-gray-200 dark:border-gray-700">
              {question.questionCode}
            </div>
          </div>

          {/* Đề bài */}
          <div className="col-span-7 min-w-0">
            <h3 className="font-medium text-sm line-clamp-1 leading-tight hover:underline decoration-1 underline-offset-2 transition-all duration-200 cursor-pointer text-foreground hover:text-primary">
              {question.title}
            </h3>
          </div>

          {/* Status (mobile) */}
          <div className="col-span-3 flex justify-end">
            {question.status && (
              <Badge
                variant="outline"
                className={`text-[9px] border-0 px-1 py-0.5 h-fit ${getStatusColor(
                  question.status
                )}`}
              >
                {question.status === "PENDING" ? "New" : question.status}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
