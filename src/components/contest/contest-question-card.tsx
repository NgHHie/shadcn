// src/components/contest/simple-contest-question-card.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";

interface ContestQuestion {
  id: string;
  question: {
    id: string;
    questionCode: string;
    title: string;
    level: "EASY" | "MEDIUM" | "HARD";
    type: string;
    acceptance: number;
  };
  point: number;
}

interface ContestQuestionCardProps {
  contestQuestion: ContestQuestion;
  status: "AC" | "PENDING";
  onClick: (questionId: string, questionCode: string) => void;
}

export const ContestQuestionCard: React.FC<ContestQuestionCardProps> = ({
  contestQuestion,
  status,
  onClick,
}) => {
  const { question } = contestQuestion;
  const isCompleted = status === "AC";

  const getStatusColor = (status: "AC" | "PENDING") => {
    switch (status) {
      case "AC":
        return "text-green-600 bg-green-50";
      case "PENDING":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status: "AC" | "PENDING") => {
    switch (status) {
      case "AC":
        return "Accepted";
      case "PENDING":
        return "Chưa làm";
      default:
        return "Chưa làm";
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer border-2 border-l-4 ${
        isCompleted
          ? "border-l-green-500 bg-green-50/30"
          : "border-l-primary bg-background"
      }`}
      onClick={() => onClick(question.id, question.questionCode)}
    >
      <CardContent className="p-1.5 sm:p-2">
        {/* Desktop layout */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center">
          {/* Status Icon */}
          <div className="col-span-1 flex justify-center">
            {isCompleted ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-gray-400" />
            )}
          </div>

          {/* Question Code */}
          <div className="col-span-2">
            <div className="text-xs font-mono font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-center">
              {question.questionCode}
            </div>
          </div>

          {/* Question Title */}
          <div className="col-span-7 min-w-0">
            <h3
              className={`font-medium text-sm line-clamp-1 leading-tight ${
                isCompleted
                  ? "text-green-700"
                  : "text-foreground hover:text-primary"
              } transition-colors`}
            >
              {question.title}
            </h3>
          </div>

          {/* Status Text */}
          <div className="col-span-2 flex justify-end">
            <span
              className={`text-xs px-2 py-1 rounded-md font-medium ${getStatusColor(
                status
              )}`}
            >
              {getStatusText(status)}
            </span>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="sm:hidden grid grid-cols-12 gap-2 items-center">
          {/* Status Icon */}
          <div className="col-span-1 flex justify-center">
            {isCompleted ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-gray-400" />
            )}
          </div>

          {/* Question Code */}
          <div className="col-span-2">
            <div className="text-[10px] font-mono font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded border border-gray-200 dark:border-gray-700 text-center">
              {question.questionCode}
            </div>
          </div>

          {/* Question Title */}
          <div className="col-span-7 min-w-0">
            <h3
              className={`font-medium text-sm line-clamp-1 leading-tight ${
                isCompleted
                  ? "text-green-700"
                  : "text-foreground hover:text-primary"
              } transition-colors`}
            >
              {question.title}
            </h3>
          </div>

          {/* Status (short) */}
          <div className="col-span-2 flex justify-end">
            <span
              className={`text-xs px-1 py-0.5 rounded font-medium ${getStatusColor(
                status
              )}`}
            >
              {status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
