import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  Send,
  BookOpen,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuiz } from "@/hooks/use-quiz";
import type { PublicQuiz, Question } from "@/services/quizService";
import { quizService } from "@/services/quizService";
import "@/styles/quiz-shared.css";
import "./style.css";
import { QuestionMap } from "@/components/quiz/QuestionMap/QuestionMap";

const QUESTIONS_PER_PAGE = 10;

interface QuestionStatus {
  id: string;
  isAnswered: boolean;
  isFlagged: boolean;
  isActive: boolean;
}

interface LocationState {
  submissionId: { submissionId: string };
  quizInfo: PublicQuiz;
  questions: Question[];
}

export default function QuizTakingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading } = useQuiz();
  const state = location.state as LocationState;
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // State management
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Pagination calculations
  const totalPages = Math.ceil(state?.questions?.length / QUESTIONS_PER_PAGE || 0);
  const currentPageQuestions = state?.questions?.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  ) || [];

  // Initialize refs array when page changes
  useEffect(() => {
    questionRefs.current = new Array(currentPageQuestions.length).fill(null);
  }, [currentPage, currentPageQuestions.length]);

  // Handle answer selection
  const handleAnswerSelect = async (questionId: string, answerId: string, isMultipleChoice: boolean) => {
    try {
      const actualSubmissionId = state.submissionId.submissionId
      if (isMultipleChoice) {
        setSelectedAnswers((prev) => {
          const currentAnswers = prev[questionId] || [];
          const newAnswers = currentAnswers.includes(answerId)
            ? currentAnswers.filter((id) => id !== answerId)
            : [...currentAnswers, answerId];
          return { ...prev, [questionId]: newAnswers };
        });
      } else {
        setSelectedAnswers((prev) => {
          return { ...prev, [questionId]: [answerId] };
        });
      }

      // Always send only answerId as string
      await quizService.submitSingleAnswer({
        submissionId: actualSubmissionId,
        questionId: questionId,
        selectedAnswerId: answerId
      });
    } catch (err) {
      console.error("Error submitting answer:", err);
      toast.error(err instanceof Error ? err.message : "Không thể lưu câu trả lời");
    }
  };

  // Handle question flag
  const handleFlagQuestion = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }
      return newFlagged;
    });
  };

  // Navigate to question
  const goToQuestion = (questionIndex: number) => {
    const pageIndex = Math.floor(questionIndex / QUESTIONS_PER_PAGE);
    const questionIndexInPage = questionIndex % QUESTIONS_PER_PAGE;
    const NAVIGATION_DELAY = 250;

    setCurrentQuestionIndex(questionIndex);
    
    const scrollToQuestionAndHighlight = (element: HTMLElement) => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
      element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
      }, 2000);
    };

    if (pageIndex !== currentPage) {
      setCurrentPage(pageIndex);
    }

    setTimeout(() => {
      const questionElement = questionRefs.current[questionIndexInPage];
      if (questionElement) {
        scrollToQuestionAndHighlight(questionElement);
      } else {
        const fallbackElement = document.querySelector(`[data-question-index="${questionIndex}"]`) as HTMLElement;
        if (fallbackElement) {
          scrollToQuestionAndHighlight(fallbackElement);
        }
      }
    }, NAVIGATION_DELAY);
  };

  // Handle quiz completion
  const handleFinishQuiz = async () => {
    if (isSubmitting) return;

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn nộp bài? Sau khi nộp bài, bạn không thể thay đổi câu trả lời.'
    );

    if (!confirmed) return;

    try {
      console.log('State:', state);
      console.log('SubmissionId:', state.submissionId);
      console.log('Type of submissionId:', typeof state.submissionId);
      
      if (!state?.submissionId) {
        throw new Error('Không tìm thấy ID bài thi');
      }

      // Extract the actual submissionId value
      let actualSubmissionId: string;
      if (typeof state.submissionId === 'object' && state.submissionId !== null) {
        actualSubmissionId = (state.submissionId as { submissionId: string }).submissionId;
      } else {
        actualSubmissionId = String(state.submissionId);
      }

      console.log('Actual submissionId:', actualSubmissionId);

      setIsSubmitting(true);
      const result = await quizService.finishSubmission(actualSubmissionId);
      navigate(`/quiz/quiz-result/${actualSubmissionId}`, {
        state: { result: result.data }
      });
    } catch (err) {
      console.error("Error finishing quiz:", err);
      toast.error(err instanceof Error ? err.message : "Không thể nộp bài thi");
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <h2 className="text-xl font-semibold mb-2">Đang chuẩn bị bài thi...</h2>
            <p className="text-muted-foreground">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!state?.quizInfo || !state?.questions) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Không có câu hỏi</h2>
          <p className="text-muted-foreground mb-4">
            Bài thi này hiện tại chưa có câu hỏi nào.
          </p>
          <Button onClick={() => navigate('/quiz/quiz-list')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách bài thi
          </Button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).filter(qId => selectedAnswers[qId].length > 0).length;

  // Create QuestionStatus array for QuestionMap component
  const questionStatuses: QuestionStatus[] = state.questions.map((question, index) => ({
    id: question.id,
    isAnswered: selectedAnswers[question.id] && selectedAnswers[question.id].length > 0,
    isFlagged: flaggedQuestions.has(question.id),
    isActive: index === currentQuestionIndex
  }));

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <div className="flex relative">
        {/* Question Map Sidebar - Desktop */}
        <div className="hidden lg:block w-80 border-r bg-background sticky-sidebar transition-colors duration-200">
          <ScrollArea className="h-screen">
            <div className="p-4 space-y-4 flex flex-col h-full">
              <QuestionMap
                questions={questionStatuses}
                onQuestionClick={goToQuestion}
                currentQuestionIndex={currentQuestionIndex}
              />

              <Separator />

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tiến độ</span>
                  <span>{Math.round((answeredCount / state.questions.length) * 100)}%</span>
                </div>
                <Progress value={(answeredCount / state.questions.length) * 100} className="h-2" />
              </div>

              <Button
                onClick={handleFinishQuiz}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Đang nộp bài...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Nộp bài ({answeredCount}/{state.questions.length})
                  </>
                )}
              </Button>
            </div>
          </ScrollArea>
        </div>

        {/* Questions Content Area */}
        <div className="flex-1">
          <div className="max-w-4xl mx-auto p-6">
            {/* Questions */}
            <div className="space-y-6">
              {currentPageQuestions.map((question, index) => {
                const globalIndex = currentPage * QUESTIONS_PER_PAGE + index;
                const isFlagged = flaggedQuestions.has(question.id);

                return (
                  <Card
                    key={question.id}
                    className="transition-colors duration-200"
                    ref={el => {
                      questionRefs.current[index] = el;
                    }}
                    id={`question-${question.id}`}
                    data-question-index={globalIndex}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="px-3 py-1">
                            #{globalIndex + 1}
                          </Badge>
                          <div>
                            <CardTitle className="text-lg">Câu {globalIndex + 1}</CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              {question.type === 'singleChoice' ? (
                                <>
                                  <FileText className="w-3 h-3 mr-1" />
                                  Một đáp án
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Nhiều đáp án
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFlagQuestion(question.id)}
                          className={cn(
                            "h-9 w-9 p-0",
                            isFlagged && "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"
                          )}
                          title={isFlagged ? "Bỏ đánh dấu cờ" : "Đánh dấu cờ để xem lại"}
                        >
                          <Flag className={cn("h-4 w-4", isFlagged && "fill-current")} />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Question Content */}
                      <div className="mb-6">
                        <p className="text-lg leading-relaxed text-gray-900 dark:text-gray-100 mb-4">
                          {question.content}
                        </p>
                        {question.media_url && (
                          <img
                            src={question.media_url}
                            alt="Question image"
                            className="max-w-full h-auto rounded-lg border shadow-sm"
                          />
                        )}
                      </div>

                      {/* Answer Options */}
                      <div className="space-y-3">
                        {question.answers && question.answers.length > 0 ? (
                          question.type === 'multipleChoice' ? (
                            // Multiple Choice
                            <div className="space-y-3">
                              {question.answers.map((answer, answerIndex) => {
                                const isChecked = selectedAnswers[question.id]?.includes(answer.id) || false;
                                const answerLabel = String.fromCharCode(65 + answerIndex);
                                return (
                                  <div key={answer.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <Checkbox
                                      id={answer.id}
                                      checked={isChecked}
                                      onCheckedChange={() => {
                                        handleAnswerSelect(question.id, answer.id, true);
                                      }}
                                    />
                                    <Label
                                      htmlFor={answer.id}
                                      className="flex-1 cursor-pointer flex items-center gap-3"
                                    >
                                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                        {answerLabel}
                                      </Badge>
                                      <span>{answer.content}</span>
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            // Single Choice
                            <RadioGroup
                              value={selectedAnswers[question.id]?.[0] || ""}
                              onValueChange={(value) => handleAnswerSelect(question.id, value, false)}
                            >
                              {question.answers.map((answer, answerIndex) => {
                                const answerLabel = String.fromCharCode(65 + answerIndex);
                                return (
                                  <div key={answer.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                    <RadioGroupItem value={answer.id} id={answer.id} />
                                    <Label
                                      htmlFor={answer.id}
                                      className="flex-1 cursor-pointer flex items-center gap-3"
                                    >
                                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                                        {answerLabel}
                                      </Badge>
                                      <span>{answer.content}</span>
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          )
                        ) : (
                          // No answers
                          <div className="text-center py-8 text-muted-foreground">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Không có câu trả lời cho câu hỏi này</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPage = Math.max(0, currentPage - 1);
                      setCurrentPage(newPage);
                      setCurrentQuestionIndex(newPage * QUESTIONS_PER_PAGE);
                      setTimeout(() => {
                        const firstQuestionIndex = newPage * QUESTIONS_PER_PAGE;
                        const firstQuestionElement = questionRefs.current[firstQuestionIndex % QUESTIONS_PER_PAGE];
                        if (firstQuestionElement) {
                          firstQuestionElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                            inline: 'nearest'
                          });
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }, 150);
                    }}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Trang trước
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Trang {currentPage + 1} / {totalPages}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({currentPage * QUESTIONS_PER_PAGE + 1}-{Math.min((currentPage + 1) * QUESTIONS_PER_PAGE, state.questions.length)} / {state.questions.length} câu)
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPage = Math.min(totalPages - 1, currentPage + 1);
                      setCurrentPage(newPage);
                      setCurrentQuestionIndex(newPage * QUESTIONS_PER_PAGE);
                      setTimeout(() => {
                        const firstQuestionIndex = newPage * QUESTIONS_PER_PAGE;
                        const firstQuestionElement = questionRefs.current[firstQuestionIndex % QUESTIONS_PER_PAGE];
                        if (firstQuestionElement) {
                          firstQuestionElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                            inline: 'nearest'
                          });
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }, 150);
                    }}
                    disabled={currentPage === totalPages - 1}
                  >
                    Trang sau
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
