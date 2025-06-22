import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, User, ListChecks, ArrowLeft, Play, AlertCircle, Timer } from "lucide-react";
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
  const [timeLeft, setTimeLeft] = useState<string>("");

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

  // Tính thời gian còn lại đến khi có thể làm bài
  const calculateTimeLeft = (startTime: string) => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const difference = start - now;

    if (difference <= 0) return "";

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days} ngày ${hours} giờ ${minutes} phút`;
    } else if (hours > 0) {
      return `${hours} giờ ${minutes} phút ${seconds} giây`;
    } else if (minutes > 0) {
      return `${minutes} phút ${seconds} giây`;
    } else {
      return `${seconds} giây`;
    }
  };

  // Update countdown timer
  useEffect(() => {
    if (!quiz) return;

    const timer = setInterval(() => {
      const status = getQuizStatus(quiz);
      if (status === "upcoming") {
        setTimeLeft(calculateTimeLeft(quiz.startTime));
      } else {
        setTimeLeft("");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz]);

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
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{t("list.status.upcoming")}</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">{t("list.status.expired")}</Badge>;
      default:
        return <Badge>{t("list.status.expired")}</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "upcoming":
        return {
          type: "default" as const,
          title: t("detail.notYetTime"),
          description: `Bài thi sẽ bắt đầu vào ${new Date(quiz!.startTime).toLocaleString()}. Thời gian còn lại: ${timeLeft}`,
          icon: Timer
        };
      case "expired":
        return {
          type: "destructive" as const,
          title: t("detail.timeExpired"),
          description: `Bài thi đã kết thúc vào ${new Date(quiz!.endTime).toLocaleString()}`,
          icon: AlertCircle
        };
      default:
        return null;
    }
  };

  const handleStartQuiz = async () => {
    if (!quiz || !userId) return;
    
    const status = getQuizStatus(quiz);
    if (status !== "available") {
      if (status === "upcoming") {
        alert(`Bài thi chưa bắt đầu. Vui lòng đợi thêm ${timeLeft}`);
      } else if (status === "expired") {
        alert("Bài thi đã kết thúc. Không thể làm bài.");
      }
      return;
    }

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
  const statusMessage = getStatusMessage(status);

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
        <div className="flex flex-col items-end gap-2">
          <Button
            className="h-12 px-8 text-base font-semibold shadow-md"
            size="lg"
            disabled={isStartDisabled || starting}
            onClick={handleStartQuiz}
            variant={status === "available" ? "default" : "secondary"}
          >
            <Play className="w-5 h-5 mr-2" />
            {starting ? t("detail.starting") : 
             status === "upcoming" ? t("detail.waitingToStart") :
             status === "expired" ? t("detail.ended") :
             t("detail.startNow")}
          </Button>
          {status === "upcoming" && timeLeft && (
            <div className="text-xs text-muted-foreground text-center">
              Còn {timeLeft}
            </div>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <Alert variant={statusMessage.type}>
          <statusMessage.icon className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">{statusMessage.title}</div>
            <div className="text-sm mt-1">{statusMessage.description}</div>
          </AlertDescription>
        </Alert>
      )}

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
