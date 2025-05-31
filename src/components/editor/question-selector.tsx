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
} from "lucide-react";

// Import data từ file JSON
import questionsData from "./data/questions-data.json";

interface Question {
  id: number;
  title: string;
  status: "AC" | "WA" | "TLE" | "Not Started";
  difficulty: "Easy" | "Medium" | "Hard";
  type: string; // SELECT, INSERT, UPDATE, DELETE, CREATE, PROCEDURE, INDEX
  category: string;
  tags: string[];
  code: string;
  description: string;
}

interface QuestionSelectorProps {
  currentQuestionId: number;
  onQuestionChange: (question: Question) => void;
}

export const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  currentQuestionId,
  onQuestionChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Cast imported data to proper type
  const questions: Question[] = questionsData as Question[];

  // Filter questions based on search term
  const filteredQuestions = questions.filter(
    (q) =>
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Find current question
  const currentQuestion = questions.find((q) => q.id === currentQuestionId);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

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
      case "Easy":
        return "text-green-600 dark:text-green-400";
      case "Medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "Hard":
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 whitespace-nowrap flex-shrink-0 max-w-[200px]"
        >
          <span className="text-sm truncate">Chọn câu hỏi</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="p-0 w-[calc(100vw-2rem)] sm:w-[400px] md:w-[450px] lg:w-[500px]"
        align="end"
        sideOffset={4}
      >
        {/* Header with search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, loại câu hỏi..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-8"
            />
          </div>
        </div>

        {/* Question list */}
        <div className="max-h-[350px] overflow-y-auto">
          {paginatedQuestions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Không tìm thấy câu hỏi nào
            </div>
          ) : (
            paginatedQuestions.map((question) => (
              <div
                key={question.id}
                className={`p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors ${
                  question.id === currentQuestionId ? "bg-primary/10" : ""
                }`}
                onClick={() => onQuestionChange(question)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate block">
                      {question.title}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`flex gap-1 px-1.5 py-0.5 text-xs ${getStatusColor(
                      question.status
                    )} border-0 ml-2`}
                  >
                    {getStatusIcon(question.status)}
                    {question.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t bg-muted/30">
            <span className="text-xs text-muted-foreground">
              Trang {currentPage} / {totalPages} ({filteredQuestions.length} câu
              hỏi)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
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
