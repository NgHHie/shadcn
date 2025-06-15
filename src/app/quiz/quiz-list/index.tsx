import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen,
  Play,
  Users,
  Calendar,
  User,
  Grid3X3,
  List,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useQuiz } from "@/hooks/use-quiz";
import type { PublicQuiz } from "@/services/quizService";
import "@/styles/quiz-shared.css";
import "./style.css";

// Constants
const ITEMS_PER_PAGE = 9;

export default function QuizListPage() {
  // View mode state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Search and filter state
  const [searchParams, setSearchParams] = useState({
    query: "",
    page: 1,
    limit: ITEMS_PER_PAGE,
    filters: {
      status: "all" as "all" | "available" | "upcoming" | "expired",
    },
    sortBy: "newest" as "newest" | "oldest" | "title" | "questions" | "startTime",
  });

  // Get quizzes from hook
  const { quizzes, loading: quizLoading, error, fetchQuizzes } = useQuiz();

  // Filter and sort quizzes
  const filteredQuizzes = useMemo(() => {
    let filtered = [...quizzes];

    // Apply search filter
    if (searchParams.query.trim()) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchParams.query.toLowerCase()) ||
        quiz.code?.toLowerCase().includes(searchParams.query.toLowerCase()) ||
        quiz.createdBy.toLowerCase().includes(searchParams.query.toLowerCase())
      );
    }

    // Apply status filter
    if (searchParams.filters.status !== "all") {
      filtered = filtered.filter(quiz => {
        const status = getQuizStatus(quiz);
        return status === searchParams.filters.status;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (searchParams.sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "questions":
          return b.totalQuestions - a.totalQuestions;
        case "startTime":
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [quizzes, searchParams]);

  // Get quiz status
  const getQuizStatus = (quiz: PublicQuiz): "available" | "upcoming" | "expired" => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(quiz.endTime);

    if (now < startTime) return "upcoming";
    if (now > endTime) return "expired";
    return "available";
  };

  // Get status badge
  const getStatusBadge = (quiz: PublicQuiz) => {
    const status = getQuizStatus(quiz);

    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Đang mở</Badge>;
      case 'upcoming':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Sắp diễn ra</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Đã kết thúc</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  // Update search params helper
  const updateSearchParams = (updates: Partial<typeof searchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...updates,
      page: updates.page || 1 // Reset to page 1 when changing filters
    }));
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      total: filteredQuizzes.length,
      available: filteredQuizzes.filter(q => getQuizStatus(q) === 'available').length,
      upcoming: filteredQuizzes.filter(q => getQuizStatus(q) === 'upcoming').length,
      expired: filteredQuizzes.filter(q => getQuizStatus(q) === 'expired').length,
    };
  }, [filteredQuizzes]);

  // Pagination
  const totalPages = Math.ceil(filteredQuizzes.length / searchParams.limit);
  const startIndex = (searchParams.page - 1) * searchParams.limit;
  const paginatedQuizzes = filteredQuizzes.slice(startIndex, startIndex + searchParams.limit);

  // Loading skeleton
  if (quizLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Đã có lỗi xảy ra</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => fetchQuizzes()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh sách bài thi</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm bài thi..."
            value={searchParams.query}
            onChange={(e) => updateSearchParams({ query: e.target.value })}
            className="w-full"
          />
        </div>
        <Select
          value={searchParams.filters.status}
          onValueChange={(value) =>
            updateSearchParams({
              filters: { ...searchParams.filters, status: value as "all" | "available" | "upcoming" | "expired" },
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="available">Đang mở</SelectItem>
            <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
            <SelectItem value="expired">Đã kết thúc</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={searchParams.sortBy}
          onValueChange={(value) =>
            updateSearchParams({ sortBy: value as "newest" | "oldest" | "title" | "questions" | "startTime" })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>
            <SelectItem value="title">Tên bài thi</SelectItem>
            <SelectItem value="questions">Số câu hỏi</SelectItem>
            <SelectItem value="startTime">Thời gian bắt đầu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng số bài thi</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang mở</p>
                <h3 className="text-2xl font-bold">{stats.available}</h3>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sắp diễn ra</p>
                <h3 className="text-2xl font-bold">{stats.upcoming}</h3>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đã kết thúc</p>
                <h3 className="text-2xl font-bold">{stats.expired}</h3>
              </div>
              <Users className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz List */}
      <div className={`gap-6 ${viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"}`}>
        {paginatedQuizzes.map((quiz) => (
          <Card key={quiz.examQuizzesId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5" />
                  {quiz.title}
                </CardTitle>
                {getStatusBadge(quiz)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{quiz.createdBy}</span>
                {quiz.code && (
                  <>
                    <span>•</span>
                    <span className="font-mono">{quiz.code}</span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{quiz.totalQuestions} câu hỏi</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {new Date(quiz.startTime).toLocaleDateString()} -{" "}
                    {new Date(quiz.endTime).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  asChild
                >
                  <Link to={`/quiz/quiz-detail/${quiz.examQuizzesId}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    Xem chi tiết
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateSearchParams({ page: searchParams.page - 1 })}
            disabled={searchParams.page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Trang {searchParams.page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateSearchParams({ page: searchParams.page + 1 })}
            disabled={searchParams.page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Empty state */}
      {paginatedQuizzes.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Không tìm thấy bài thi nào</h3>
          <p className="text-muted-foreground">
            Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      )}
    </div>
  );
}
