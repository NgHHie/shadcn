import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Flag,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useQuiz } from "@/hooks/use-quiz";
import type { PublicQuiz, Question } from "@/services/quizService";
import "@/styles/quiz-shared.css";
import "./style.css";

interface LocationState {
  submissionId: string;
  quizInfo: PublicQuiz;
  questions: Question[];
}

export default function QuizTakingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { submitSingleAnswer, finishSubmission, loading } = useQuiz();
  const state = location.state as LocationState;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize time remaining
  useEffect(() => {
    if (state?.quizInfo) {
      const endTime = new Date(state.quizInfo.endTime).getTime();
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remaining);
    }
  }, [state?.quizInfo]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleFinishQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Handle answer selection
  const handleAnswerSelect = async (questionId: string, answerId: string, isMultipleChoice: boolean) => {
    try {
      if (isMultipleChoice) {
        setSelectedAnswers((prev) => {
          const currentAnswers = prev[questionId] || [];
          const newAnswers = currentAnswers.includes(answerId)
            ? currentAnswers.filter((id) => id !== answerId)
            : [...currentAnswers, answerId];
          return { ...prev, [questionId]: newAnswers };
        });
      } else {
        setSelectedAnswers((prev) => ({
          ...prev,
          [questionId]: [answerId],
        }));
      }

      await submitSingleAnswer({
        submissionId: state.submissionId,
        questionId,
        selectedAnswerId: answerId
      });
    } catch (err) {
      console.error("Error submitting answer:", err);
      toast.error("Không thể lưu câu trả lời");
    }
  };

  // Handle question flag
  const handleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Handle navigation
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < state.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Handle quiz completion
  const handleFinishQuiz = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const result = await finishSubmission(state.submissionId);
      if (result) {
        navigate(`/quiz/result/${state.submissionId}`, {
          state: { result }
        });
      }
    } catch (err) {
      console.error("Error finishing quiz:", err);
      toast.error("Không thể nộp bài thi");
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  // No state data
  if (!state?.quizInfo || !state?.questions) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy thông tin bài thi</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Vui lòng quay lại danh sách bài thi và thử lại
          </p>
          <Button onClick={() => navigate("/quiz")}>Quay lại danh sách</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = state.questions[currentQuestionIndex];
  const isMultipleChoice = currentQuestion.type === "multipleChoice";
  const isQuestionFlagged = flaggedQuestions.includes(currentQuestion.id);
  const hasAnswered = selectedAnswers[currentQuestion.id]?.length > 0;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/quiz")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{state.quizInfo.title}</h1>
            <p className="text-muted-foreground">
              Câu hỏi {currentQuestionIndex + 1} / {state.questions.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-mono">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <Button
            variant={isQuestionFlagged ? "default" : "outline"}
            size="sm"
            onClick={() => handleFlagQuestion(currentQuestion.id)}
          >
            <Flag className="w-4 h-4 mr-2" />
            {isQuestionFlagged ? "Đã đánh dấu" : "Đánh dấu"}
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Tiến độ</span>
          <span className="text-sm font-medium">
            {Object.keys(selectedAnswers).length} / {state.questions.length} câu đã trả lời
          </span>
        </div>
        <Progress
          value={(Object.keys(selectedAnswers).length / state.questions.length) * 100}
        />
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
              {currentQuestionIndex + 1}
            </span>
            <span>{currentQuestion.content}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isMultipleChoice ? (
            <div className="space-y-4">
              {currentQuestion.answers?.map((answer) => (
                <div key={answer.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={answer.id}
                    checked={selectedAnswers[currentQuestion.id]?.includes(answer.id)}
                    onCheckedChange={() => handleAnswerSelect(currentQuestion.id, answer.id, true)}
                  />
                  <Label htmlFor={answer.id}>{answer.content}</Label>
                </div>
              ))}
            </div>
          ) : (
            <RadioGroup
              value={selectedAnswers[currentQuestion.id]?.[0]}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value, false)}
            >
              {currentQuestion.answers?.map((answer) => (
                <div key={answer.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={answer.id} id={answer.id} />
                  <Label htmlFor={answer.id}>{answer.content}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Câu trước
        </Button>
        <div className="flex items-center gap-2">
          {hasAnswered && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Đã trả lời</span>
            </div>
          )}
          {isQuestionFlagged && (
            <div className="flex items-center gap-1 text-yellow-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Đã đánh dấu</span>
            </div>
          )}
        </div>
        {currentQuestionIndex === state.questions.length - 1 ? (
          <Button
            onClick={handleFinishQuiz}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang nộp bài...
              </>
            ) : (
              "Nộp bài"
            )}
          </Button>
        ) : (
          <Button onClick={handleNextQuestion}>
            Câu tiếp theo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
