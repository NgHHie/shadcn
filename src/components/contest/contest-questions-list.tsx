// src/components/contest/contest-questions-list.tsx
import { Loader2 } from "lucide-react";
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
  getQuestionStatus: (
    questionId: string
  ) => "AC" | "WA" | "CE" | "LTE" | "RTE" | "PENDING";
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
      {/* Questions List */}
      {totalElements === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Không có câu hỏi nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {questions.map((question) => (
            <ContestQuestionCard
              key={question.id}
              question={{
                id: question.question.id,
                questionCode: question.question.questionCode,
                title: question.question.title,
                type: question.question.type,
                level: question.question.level,
                point: question.point,
                totalSub: 0, // Not needed for contest
                status: getQuestionStatus(question.id),
              }}
              onClick={() =>
                onQuestionClick(
                  question.question.id,
                  question.question.questionCode
                )
              }
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              loading={false}
              totalElements={totalElements}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
