// src/components/editor/question-selector.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheckIcon,
  XCircleIcon,
  CircleIcon,
  TimerIcon,
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
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasFoundCurrentQuestion, setHasFoundCurrentQuestion] = useState(false);

  const pageSize = 10;

  // Fetch questions without search
  const { questions, loading, totalPages } = useQuestions({
    page: currentPage,
    size: pageSize,
  });

  // Function to find page containing current question
  const findCurrentQuestionPage = async (questionId: string) => {
    if (!questionId || hasFoundCurrentQuestion) return;

    try {
      // Fallback: Search through pages manually
      // This is less efficient but works without additional API
      let found = false;
      for (let page = 0; page < Math.min(totalPages, 10); page++) {
        // Limit search to first 10 pages for performance
        try {
          const response = await fetch(
            `https://api.learnsql.store/api/app/question?page=${page}&size=${pageSize}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage
                  .getItem("access_token")
                  ?.replace(/"/g, "")}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const foundQuestion = data.content.find(
              (q: any) => q.id === questionId
            );

            if (foundQuestion) {
              setCurrentPage(page);
              setHasFoundCurrentQuestion(true);
              found = true;
              break;
            }
          }
        } catch (error) {
          console.warn(`Error searching page ${page}:`, error);
        }
      }

      if (!found) {
        // If not found in first 10 pages, default to page 0
        setCurrentPage(0);
        setHasFoundCurrentQuestion(true);
      }
    } catch (error) {
      console.warn("Could not find current question page:", error);
      setCurrentPage(0);
      setHasFoundCurrentQuestion(true);
    }
  };

  // When dropdown opens and we have a current question, try to find its page
  useEffect(() => {
    if (isOpen && currentQuestionId && !hasFoundCurrentQuestion) {
      // Add a small delay to ensure the dropdown is fully opened
      const timeoutId = setTimeout(() => {
        findCurrentQuestionPage(currentQuestionId);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, currentQuestionId, hasFoundCurrentQuestion]);

  // Reset state when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setHasFoundCurrentQuestion(false);
    }
  }, [isOpen]);

  // Check if current question is in the current page
  useEffect(() => {
    if (currentQuestionId && questions.length > 0) {
      const foundInCurrentPage = questions.find(
        (q) => q.id === currentQuestionId
      );
      if (foundInCurrentPage && !hasFoundCurrentQuestion) {
        setHasFoundCurrentQuestion(true);
      }
    }
  }, [questions, currentQuestionId, hasFoundCurrentQuestion]);

  // Reset to page 0 when needed
  useEffect(() => {
    setHasFoundCurrentQuestion(false);
  }, [currentPage]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AC":
        return <CircleCheckIcon className="h-3 w-3" />;
      case "WA":
        return <XCircleIcon className="h-3 w-3" />;
      case "TLE":
        return <TimerIcon className="h-3 w-3" />;
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
          className="gap-1 p-1 border-2 h-auto hover:bg-muted/50"
        >
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
          Câu hỏi
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="p-0 w-[calc(100vw-2rem)] sm:w-[400px] md:w-[450px] lg:w-[500px]"
        align="start"
        sideOffset={4}
      >
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
                      {question.status || "Not Started"}
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
