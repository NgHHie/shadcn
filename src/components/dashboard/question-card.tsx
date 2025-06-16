// src/components/dashboard/question-card.tsx - Mobile optimized with icon button
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Play } from "lucide-react";

interface QuestionCardProps {
  question: {
    id: string;
    questionCode: string;
    title: string;
    type: string;
    level: string;
    point: number;
    status?: "AC" | "WA" | "TLE" | "CE" | "Not Started";
  };
  onClick: (questionId: string, questionTitle: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onClick,
}) => {
  const getStatusBorderColor = (status?: string) => {
    switch (status) {
      case "AC":
        return "border-l-green-500"; // Màu xanh cho AC
      case "WA":
      case "TLE":
      case "CE":
        return "border-l-red-500"; // Màu đỏ cho các lỗi
      default:
        return "border-l-primary"; // Màu mặc định cho Not Started
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

  // Desktop: Full text
  const getStatusTextDesktop = (status?: string) => {
    switch (status) {
      case "AC":
        return "Accepted";
      case "WA":
        return "Wrong Answer";
      case "TLE":
        return "Time Limit";
      case "CE":
        return "Compile Error";
      default:
        return "Not Started";
    }
  };

  // Mobile: Short text
  const getStatusTextMobile = (status?: string) => {
    switch (status) {
      case "AC":
        return "AC";
      case "WA":
        return "WA";
      case "TLE":
        return "TLE";
      case "CE":
        return "CE";
      default:
        return "New";
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-md hover:scale-[1.01] border-2 border-l-4 ${getStatusBorderColor(
        question.status
      )}`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Content */}
          <div className="flex-1 min-w-0">
            {/* Row 1: Badges, Level, Point */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="text-xs font-mono border-2">
                {question.questionCode}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${getTypeColor(question.type)} border-0`}
              >
                {question.type}
              </Badge>
              <span
                className={`text-xs font-medium ${getLevelColor(
                  question.level
                )}`}
              >
                {question.level}
              </span>
              {/* Point */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="hidden sm:inline">{question.point} điểm</span>
                <span className="sm:hidden">{question.point}</span>
              </div>
            </div>

            {/* Row 2: Title only */}
            <h3
              className="font-medium text-sm sm:text-base line-clamp-1 leading-tight cursor-pointer hover:underline decoration-1 underline-offset-2 transition-all duration-200"
              onClick={() => onClick(question.id, question.title)}
            >
              {question.title}
            </h3>
          </div>

          {/* Right side - Button and Status stacked */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Button - Desktop: with text, Mobile: icon only */}
            <Button
              size="sm"
              variant="outline"
              className="text-xs sm:px-3 sm:py-1 px-2 py-1"
              onClick={(e) => {
                e.stopPropagation();
                onClick(question.id, question.title);
              }}
            >
              <Play className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">Bắt đầu</span>
            </Button>

            {/* Status badge - Desktop: full text, Mobile: short text */}
            {question.status && (
              <>
                {/* Desktop status */}
                <Badge
                  variant="outline"
                  className={`hidden sm:inline-flex text-xs ${getStatusColor(
                    question.status
                  )} border-0`}
                >
                  {getStatusTextDesktop(question.status)}
                </Badge>

                {/* Mobile status */}
                <Badge
                  variant="outline"
                  className={`sm:hidden text-xs px-1.5 py-0.5 ${getStatusColor(
                    question.status
                  )} border-0`}
                >
                  {getStatusTextMobile(question.status)}
                </Badge>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
