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
          <Badge variant="outline" className="gap-1 text-primary border-primary/30 transition-colors duration-200">
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
                  // Trạng thái active (câu hỏi hiện tại)
                  isActive && "ring-2 ring-ring ring-offset-1 lg:ring-offset-2 bg-primary text-primary-foreground",
                  // Trạng thái đã làm
                  question.isAnswered && !isActive && "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30",
                  // Trạng thái đánh dấu cờ
                  question.isFlagged && !question.isAnswered && !isActive && "bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80",
                  // Trạng thái vừa làm vừa đánh dấu cờ
                  question.isFlagged && question.isAnswered && !isActive && "bg-primary/30 text-primary border-primary hover:bg-primary/40",
                  // Trạng thái chưa làm (mặc định)
                  !question.isAnswered && !question.isFlagged && !isActive && "hover:bg-muted"
                )}
              >
                {questionNumber}
                {question.isFlagged && (
                  <Flag className="absolute -top-0.5 -right-0.5 lg:-top-1 lg:-right-1 h-2.5 w-2.5 lg:h-3 lg:w-3 text-primary fill-current" />
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
