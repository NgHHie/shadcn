// src/components/editor/question-selector.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  X,
} from "lucide-react";
import { useQuestions } from "@/hooks/use-questions";
import type { QuestionFilterCriteria } from "@/hooks/use-questions";

interface QuestionSelectorProps {
  currentQuestionId?: string;
  onQuestionChange: (questionId: string) => void;
}

export const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  currentQuestionId,
  onQuestionChange,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<QuestionFilterCriteria>(
    {}
  );
  const [hasFoundCurrentQuestion, setHasFoundCurrentQuestion] = useState(false);

  const pageSize = 10;

  // Use the real useQuestions hook like in exercise page
  const {
    questions,
    loading,
    totalPages,
    error,
    searchWithFilter,
    changePage,
  } = useQuestions({
    pagination: {
      page: currentPage,
      size: pageSize,
      sort: ["createdAt,desc"],
    },
    criteria: filterCriteria,
    autoFetch: true,
  });

  // Function to find page containing current question
  const findCurrentQuestionPage = async (questionId: string) => {
    if (!questionId || hasFoundCurrentQuestion) return;

    try {
      // Fallback: Search through pages manually
      let found = false;
      for (let page = 0; page < totalPages; page++) {
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
              changePage(page);
              found = true;
              break;
            }
          }
        } catch (error) {
          console.warn(`Error searching page ${page}:`, error);
        }
      }

      if (!found) {
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
    if (
      isOpen &&
      currentQuestionId &&
      !hasFoundCurrentQuestion &&
      !filterCriteria.keyword
    ) {
      const timeoutId = setTimeout(() => {
        findCurrentQuestionPage(currentQuestionId);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [
    isOpen,
    currentQuestionId,
    hasFoundCurrentQuestion,
    filterCriteria.keyword,
  ]);

  // Reset state when search term changes or dropdown closes
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

  // Handle search
  const handleSearch = () => {
    const keyword = searchInput.trim();
    const newCriteria: QuestionFilterCriteria = keyword ? { keyword } : {};
    setFilterCriteria(newCriteria);
    setCurrentPage(0);
    searchWithFilter(newCriteria, { page: 0, size: pageSize });
  };

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setFilterCriteria({});
    setCurrentPage(0);
    setHasFoundCurrentQuestion(false);
    searchWithFilter({}, { page: 0, size: pageSize });
  };

  // Navigation handlers
  const handlePrevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      changePage(newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      changePage(newPage);
    }
  };

  // Status helpers
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "AC":
        return <CircleCheckIcon className="h-3 w-3" />;
      case "WA":
        return <XCircleIcon className="h-3 w-3" />;
      case "TLE":
        return <TimerIcon className="h-3 w-3" />;
      case "RTE":
      case "CE":
        return <XCircleIcon className="h-3 w-3" />;
      default:
        return <CircleIcon className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "AC":
        return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800";
      case "WA":
      case "TLE":
      case "RTE":
      case "CE":
        return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800";
      default:
        return "text-gray-500 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800";
    }
  };

  const getLevelDisplay = (level: string) => {
    switch (level) {
      case "EASY":
        return { text: "Easy", color: "text-green-600 dark:text-green-400" };
      case "MEDIUM":
        return {
          text: "Medium",
          color: "text-yellow-600 dark:text-yellow-400",
        };
      case "HARD":
        return { text: "Hard", color: "text-red-600 dark:text-red-400" };
      default:
        return { text: level, color: "text-gray-600 dark:text-gray-400" };
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
          variant="outline"
          size="sm"
          className="gap-1 p-2 h-auto hover:bg-primary/10 border-primary/30 bg-primary/5 text-primary font-medium shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md"
        >
          <ChevronDown className="h-4 w-4 text-primary" />
          <span className="text-xs text-primary font-semibold">
            Chọn câu hỏi
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="p-0 w-[calc(100vw-2rem)] sm:w-[500px] md:w-[600px] lg:w-[700px] shadow-xl border-2 border-primary/20"
        align="start"
        sideOffset={4}
      >
        {/* Header with search */}
        <div className="p-3 border-b bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nhập mã hoặc tiêu đề câu hỏi..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="pl-8 pr-8 h-8 text-sm border-primary/30 focus:border-primary"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-destructive/10"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleSearch}
              className="h-8 px-3 bg-primary hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question list */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">
                  Đang tải...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-sm text-destructive mb-2">Có lỗi xảy ra</p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">
                Không tìm thấy câu hỏi nào
              </p>
            </div>
          ) : (
            <div className="py-2">
              {questions.map((question) => {
                const levelDisplay = getLevelDisplay(question.level);
                const isSelected = currentQuestionId === question.id;

                return (
                  <div
                    key={question.id}
                    onClick={() => handleQuestionSelect(question.id)}
                    className={`px-3 py-2 cursor-pointer transition-colors hover:bg-primary/5 border-l-2 ${
                      isSelected
                        ? "bg-primary/10 border-l-primary"
                        : "border-l-transparent"
                    }`}
                  >
                    {/* Single line layout with all info */}
                    <div className="flex items-center gap-2 w-full">
                      {/* Status icon */}
                      <div
                        className={`flex items-center justify-center w-5 h-5 rounded-full border ${getStatusColor(
                          question.status
                        )}`}
                      >
                        {getStatusIcon(question.status)}
                      </div>

                      {/* Question code */}
                      <div className="text-xs font-mono text-muted-foreground min-w-0 flex-shrink-0">
                        {question.questionCode}
                      </div>

                      {/* Title - truncated */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {question.title}
                        </p>
                      </div>

                      {/* Level badge */}
                      <div
                        className={`text-xs font-medium px-2 py-0.5 rounded ${levelDisplay.color} bg-current/10 border border-current/20 flex-shrink-0`}
                      >
                        {levelDisplay.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination footer */}
        {!loading && questions.length > 0 && (
          <div className="border-t bg-muted/30 px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Trang {currentPage + 1} / {totalPages}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages - 1}
                  className="h-7 px-2"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
