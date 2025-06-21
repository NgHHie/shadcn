// src/components/contest/contest-questions-list-fixed.tsx
import { BookOpen, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/dashboard/pagination";
import { ContestQuestionCard } from "./contest-question-card";

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

interface ContestQuestionsListProps {
  questions: ContestQuestion[];
  getQuestionStatus: (questionId: string) => "AC" | "PENDING";
  onQuestionClick: (questionId: string, questionCode: string) => void;
  loading?: boolean;
  totalElements: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ContestQuestionsList({
  questions,
  getQuestionStatus,
  onQuestionClick,
  loading = false,
  totalElements,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ContestQuestionsListProps) {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <h2 className="text-lg font-semibold">
            Danh sách câu hỏi
            {!loading && (
              <span className="text-muted-foreground font-normal">
                ({totalElements} câu)
              </span>
            )}
          </h2>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>

        {/* Question status summary */}
        {!loading && totalElements > 0 && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              {
                questions.filter((q) => getQuestionStatus(q.id) === "AC").length
              }{" "}
              đã hoàn thành
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              {
                questions.filter((q) => getQuestionStatus(q.id) === "PENDING")
                  .length
              }{" "}
              chưa làm
            </span>
          </div>
        )}
      </div>

      {/* Questions List */}
      {totalElements === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có câu hỏi nào trong cuộc thi này</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Questions Grid */}
          <div className="grid gap-1">
            {questions.map((contestQuestion) => (
              <ContestQuestionCard
                key={contestQuestion.id}
                contestQuestion={contestQuestion}
                status={getQuestionStatus(contestQuestion.id)}
                onClick={onQuestionClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              loading={false}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          )}
        </>
      )}
    </div>
  );
}
