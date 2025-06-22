import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Flag, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { QuestionStatus } from "@/types/quiz";
import "./style.css";

interface QuestionMapProps {
  questions: QuestionStatus[];
  onQuestionClick: (questionIndex: number) => void;
  currentQuestionIndex: number;
  className?: string;
}

export function QuestionMap({
  questions,
  onQuestionClick,
  currentQuestionIndex,
  className
}: QuestionMapProps) {
  const { t } = useTranslation('quiz');
  const answeredCount = questions.filter(q => q.isAnswered).length;
  const flaggedCount = questions.filter(q => q.isFlagged).length;

  return (
    <Card className={cn("h-fit transition-colors duration-200", className)}>
      <CardHeader>
        <CardTitle className="text-base lg:text-lg">{t("taking.questionMap")}</CardTitle>
        <div className="flex flex-wrap gap-2 text-xs lg:text-sm">
          <Badge variant="secondary" className="gap-1 transition-colors duration-200">
            <CheckCircle className="h-3 w-3" />
            {t("taking.answered")}: {answeredCount}
          </Badge>
          <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-300 dark:text-yellow-400 dark:border-yellow-700 transition-colors duration-200">
            <Flag className="h-3 w-3" />
            {t("taking.flagged")}: {flaggedCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-5 lg:grid-cols-5 gap-1.5 lg:gap-2">
          {questions.map((question, index) => {
            const questionNumber = index + 1;
            const isActive = index === currentQuestionIndex;

            return (
              <Button
                key={question.id}
                variant="outline"
                size="sm"
                onClick={() => onQuestionClick(index)}
                className={cn(
                  "relative h-8 w-8 lg:h-10 lg:w-10 p-0 text-xs lg:text-sm font-medium transition-all duration-200",
                  // Trạng thái active (câu hỏi hiện tại) - thêm ring nhưng không thay đổi background
                  isActive && "ring-2 ring-blue-500 ring-offset-1 lg:ring-offset-2 shadow-md",
                  // Trạng thái đã làm (màu xanh lá) - luôn hiển thị khi đã trả lời
                  question.isAnswered && "bg-green-100 text-green-700 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700",
                  // Trạng thái đánh dấu cờ (màu vàng) - chỉ khi chưa trả lời
                  question.isFlagged && !question.isAnswered && "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700",
                  // Trạng thái vừa làm vừa đánh dấu cờ - ưu tiên màu xanh nhưng có gradient
                  question.isFlagged && question.isAnswered && "bg-gradient-to-br from-green-100 to-yellow-100 text-green-700 border-green-300 hover:from-green-200 hover:to-yellow-200 dark:from-green-900/20 dark:to-yellow-900/20 dark:text-green-400",
                  // Trạng thái chưa làm (mặc định) - chỉ khi chưa trả lời và chưa flag
                  !question.isAnswered && !question.isFlagged && "hover:bg-muted"
                )}
              >
                {questionNumber}
                {question.isFlagged && (
                  <Flag className="absolute -top-0.5 -right-0.5 lg:-top-1 lg:-right-1 h-2.5 w-2.5 lg:h-3 lg:w-3 text-yellow-500 fill-current" />
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
