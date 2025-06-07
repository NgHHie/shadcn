// src/components/editor/question-selector.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  CircleCheckIcon,
  XCircleIcon,
  CircleIcon,
  TimerIcon,
  AlertCircleIcon,
} from "lucide-react";
import { useQuestions } from "@/hooks/use-questions";

interface QuestionSelectorProps {
  currentQuestionId?: string;
  onQuestionChange: (questionId: string) => void;
}

export const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  currentQuestionId,
  onQuestionChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const pageSize = 10;

  // Fetch questions from API with real completion status
  const {
    questions,
    loading,
    totalPages,
    currentPage: apiCurrentPage,
  } = useQuestions({
    page: currentPage,
    size: pageSize,
    search: searchTerm || undefined,
  });

  // Find current question
  const currentQuestion = questions.find((q) => q.id === currentQuestionId);

  // Reset to page 0 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AC":
        return <CircleCheckIcon className="h-3 w-3" />;
      case "WA":
        return <XCircleIcon className="h-3 w-3" />;
      case "TLE":
        return <TimerIcon className="h-3 w-3" />;
      case "CE":
        return <AlertCircleIcon className="h-3 w-3" />;
      default:
        return <CircleIcon className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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
        return "Not Started";
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

  const handleQuestionSelect = (questionId: string) => {
    onQuestionChange(questionId);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 p-1 h-auto hover:bg-muted/50"
        >
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="p-0 w-[calc(100vw-2rem)] sm:w-[400px] md:w-[450px] lg:w-[500px]"
        align="start"
        sideOffset={4}
      >
        {/* Header with search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm câu hỏi..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-8"
            />
          </div>
        </div>

        {/* Question list */}
        <div className="max-h-[350px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
              Đang tải...
            </div>
          ) : questions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Không tìm thấy câu hỏi nào
            </div>
          ) : (
            questions.map((question) => (
              <div
                key={question.id}
                className={`p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors ${
                  question.id === currentQuestionId ? "bg-primary/10" : ""
                }`}
                onClick={() => handleQuestionSelect(question.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">
                        {question.questionCode}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs px-1.5 py-0.5 ${getTypeColor(
                          question.type
                        )} border-0`}
                      >
                        {question.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                      {question.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant="outline"
                      className={`flex gap-1 px-1.5 py-0.5 text-xs ${getStatusColor(
                        question.status || "Not Started"
                      )} border-0`}
                    >
                      {getStatusIcon(question.status || "Not Started")}
                      {getStatusText(question.status || "Not Started")}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium ${getDifficultyColor(
                          question.level
                        )}`}
                      >
                        {question.level}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {question.point} điểm
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t bg-muted/30">
            <span className="text-xs text-muted-foreground">
              Trang {currentPage + 1} / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage === totalPages - 1}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
