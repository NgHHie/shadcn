import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, ListChecks, ArrowLeft, Play } from "lucide-react";
import { quizService, PublicQuiz } from "@/services/quizService";
import "@/styles/quiz-shared.css";
import "./style.css";
import { useUserContext } from "@/contexts/UserContext";

export default function QuizDetailPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { userId } = useUserContext();

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
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Đang mở</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Sắp diễn ra</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Đã kết thúc</Badge>;
      default:
        return <Badge>Không xác định</Badge>;
    }
  };

  const handleStartQuiz = async () => {
    if (!quiz || !userId) return;
    setStarting(true);
    try {
      // 1. Lấy danh sách câu hỏi cho user và quiz này
      const examUserQuizRes = await quizService.getExamUserQuizzes(userId, quiz.examQuizzesId);
      // 2. Tạo submission cho user và quiz này
      const submissionRes = await quizService.createSubmission(userId, quiz.examQuizzesId);
      // 3. Chuyển sang trang làm bài, truyền state
      navigate(`/quiz/take/${quiz.examQuizzesId}`, {
        state: {
          submissionId: submissionRes?.data,
          quizInfo: quiz,
          questions: examUserQuizRes?.data?.questions || [],
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error starting quiz:", err);
      alert("Không thể bắt đầu bài thi. Vui lòng thử lại!");
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
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy bài thi</h2>
          <Button onClick={() => navigate("/quiz/quiz-list")}>Quay lại danh sách</Button>
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
            <div className="text-muted-foreground text-sm font-mono">Mã bài thi: {quiz.code}</div>
          </div>
        </div>
        <Button
          className="h-12 px-8 text-base font-semibold shadow-md"
          size="lg"
          disabled={isStartDisabled || starting}
          onClick={handleStartQuiz}
        >
          <Play className="w-5 h-5 mr-2" />
          {starting ? "Đang khởi tạo..." : "Bắt đầu làm bài"}
        </Button>
      </div>

      {/* Quiz Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              Thời gian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bắt đầu:</span>
                <span>{new Date(quiz.startTime).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Kết thúc:</span>
                <span>{new Date(quiz.endTime).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListChecks className="w-5 h-5" />
              Số lượng câu hỏi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tổng số câu hỏi:</span>
              <span className="font-semibold text-lg">{quiz.totalQuestions}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Người tạo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tên:</span>
              <span>{quiz.createdBy}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nội quy thi (hardcode) */}
      <Card>
        <CardHeader>
          <CardTitle>Nội quy thi</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Không được sử dụng tài liệu, thiết bị hỗ trợ trong quá trình làm bài.</li>
            <li>Không trao đổi, sao chép bài làm với người khác.</li>
            <li>Tuân thủ thời gian làm bài đã quy định.</li>
            <li>Mọi vi phạm sẽ bị xử lý theo quy định của nhà trường.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Hướng dẫn thi (hardcode) */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn làm bài</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Đọc kỹ đề bài trước khi trả lời.</li>
            <li>Chọn đáp án đúng nhất cho mỗi câu hỏi.</li>
            <li>Kiểm tra lại bài làm trước khi nộp.</li>
            <li>Nhấn nút "Nộp bài" khi đã hoàn thành.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
