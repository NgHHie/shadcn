import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, ListChecks, ArrowLeft, Play } from "lucide-react";
import { quizService, PublicQuiz } from "@/services/quizService";
import { useTranslation } from "react-i18next";
import "@/styles/quiz-shared.css";
import "./style.css";
import { useUserContext } from "@/contexts/UserContext";

export default function QuizDetailPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { userId } = useUserContext();
  const { t } = useTranslation('quiz');

  const [quiz, setQuiz] = useState<PublicQuiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      if (!quizId) return;
      try {
        setLoadingQuiz(true);
        const response = await quizService.getQuizQuestions(quizId);
        if (response && response.data) {
          setQuiz(response.data);
        } else {
          setQuiz(null);
        }
      } catch (err) {
        setQuiz(null);
      } finally {
        setLoadingQuiz(false);
      }
    }
    fetchQuiz();
  }, [quizId]);

  // Tính trạng thái bài thi
  const getQuizStatus = (quiz: PublicQuiz) => {
    const now = new Date();
    const start = new Date(quiz.startTime);
    const end = new Date(quiz.endTime);
    if (now < start) return "upcoming";
    if (now > end) return "expired";
    return "available";
  };

  const getStatusBadge = (quiz: PublicQuiz) => {
    const status = getQuizStatus(quiz);
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{t("list.status.notStarted")}</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{t("list.status.inProgress")}</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">{t("list.status.completed")}</Badge>;
      default:
        return <Badge>{t("list.status.expired")}</Badge>;
    }
  };

  const handleStartQuiz = async () => {
    if (!quiz || !userId) return;
    setStarting(true);
    try {
      const examUserQuizRes = await quizService.getExamUserQuizzes(userId, quiz.examQuizzesId);
      const submissionRes = await quizService.createSubmission(userId, quiz.examQuizzesId);
      navigate(`/quiz/take/${quiz.examQuizzesId}`, {
        state: {
          submissionId: submissionRes.data,
          quizInfo: quiz,
          questions: examUserQuizRes?.data?.questions || [],
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error starting quiz:", err);
      alert(t("detail.errorStarting"));
    } finally {
      setStarting(false);
    }
  };

  if (loadingQuiz) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t("detail.notFound")}</h2>
          <Button onClick={() => navigate("/quiz/quiz-list")}>{t("result.backToList")}</Button>
        </div>
      </div>
    );
  }

  const status = getQuizStatus(quiz);
  const isStartDisabled = status !== "available";

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/quiz/quiz-list")}> 
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              {quiz.title}
              {getStatusBadge(quiz)}
            </h1>
            <div className="text-muted-foreground text-sm font-mono">{t("detail.quizCode")}: {quiz.code}</div>
          </div>
        </div>
        <Button
          className="h-12 px-8 text-base font-semibold shadow-md"
          size="lg"
          disabled={isStartDisabled || starting}
          onClick={handleStartQuiz}
        >
          <Play className="w-5 h-5 mr-2" />
{starting ? t("detail.starting") : t("detail.startNow")}
        </Button>
      </div>

      {/* Quiz Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              {t("detail.timeLimit")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("detail.startTime")}:</span>
                <span>{new Date(quiz.startTime).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("detail.endTime")}:</span>
                <span>{new Date(quiz.endTime).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="w-5 h-5" />
              {t("detail.totalQuestions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("detail.totalQuestions")}:</span>
              <span className="font-semibold text-lg">{quiz.totalQuestions}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              {t("detail.createdBy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("detail.name")}:</span>
              <span>{quiz.createdBy}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Rules */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detail.examRules")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>{t("detail.rule1")}</li>
            <li>{t("detail.rule2")}</li>
            <li>{t("detail.rule3")}</li>
            <li>{t("detail.rule4")}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detail.instructions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>{t("detail.instruction1")}</li>
            <li>{t("detail.instruction2")}</li>
            <li>{t("detail.instruction3")}</li>
            <li>{t("detail.instruction4")}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
