// src/components/contest/contest-question-card.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
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

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "EASY":
        return "text-green-600 bg-green-50 border-green-200";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "HARD":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer border-2 border-l-4 ${
        isCompleted
          ? "border-l-green-500 bg-green-50/50"
          : "border-l-primary bg-background"
      }`}
      onClick={() => onClick(question.id, question.questionCode)}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-4">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </div>

          {/* Question Code */}
          <div className="flex-shrink-0">
            <div className="text-xs font-mono font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
              {question.questionCode}
            </div>
          </div>

          {/* Question Title */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium text-sm line-clamp-1 leading-tight ${
                isCompleted ? "text-green-700" : "text-foreground"
              }`}
            >
              {question.title}
            </h3>
          </div>

          {/* Level Badge */}
          <div className="flex-shrink-0">
            <Badge
              variant="outline"
              className={`text-xs ${getLevelColor(question.level)}`}
            >
              {question.level}
            </Badge>
          </div>

          {/* Points */}
          <div className="flex-shrink-0 text-sm font-medium text-muted-foreground">
            {contestQuestion.point}đ
          </div>
        </div>

        {/* Mobile layout - stack vertically on small screens */}
        <div className="sm:hidden mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{question.type}</span>
            <span>{question.acceptance}% AC</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
