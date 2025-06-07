// src/app/dashboard/page.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { SectionCards } from "@/components/dashboard/section-cards";
import { useQuestions } from "@/hooks/use-questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Code,
  Trophy,
  Clock,
  Target,
  Loader2,
  AlertCircle,
  Play,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toastSuccess } from "@/lib/toast";

export function Page() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const { questions, loading, error, totalPages, totalElements, refetch } =
    useQuestions({
      page: currentPage,
      size: pageSize,
      type: selectedType || undefined,
      level: selectedLevel || undefined,
      search: searchTerm || undefined,
    });

  const handleSearch = () => {
    setCurrentPage(0); // Reset to first page when searching
    refetch();
  };

  const handleQuestionClick = (questionId: string, questionTitle: string) => {
    toastSuccess("Chuyển đến đề bài", {
      description: `Đang mở: ${questionTitle}`,
    });
    navigate(`/question-detail/${questionId}`);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "AC":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
      case "WA":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      case "TLE":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SELECT":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
      case "INSERT":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
      case "UPDATE":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
      case "DELETE":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      case "CREATE":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200";
      case "PROCEDURE":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "EASY":
        return "text-green-600 dark:text-green-400";
      case "MEDIUM":
        return "text-yellow-600 dark:text-yellow-400";
      case "HARD":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Stats Chart */}
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>

      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Danh sách bài tập SQL
          </h1>
          <p className="text-muted-foreground">
            Luyện tập hằng ngày với nhiều dạng truy vấn SQL
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Bộ lọc và tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên bài tập..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="w-full md:w-48">
                <label className="text-sm font-medium mb-2 block">
                  Loại câu lệnh
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="SELECT">SELECT</SelectItem>
                    <SelectItem value="INSERT">INSERT</SelectItem>
                    <SelectItem value="UPDATE">UPDATE</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="CREATE">CREATE</SelectItem>
                    <SelectItem value="PROCEDURE">PROCEDURE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-48">
                <label className="text-sm font-medium mb-2 block">Độ khó</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="EASY">Dễ</SelectItem>
                    <SelectItem value="MEDIUM">Trung bình</SelectItem>
                    <SelectItem value="HARD">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSearch} className="w-full md:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Bài tập ({totalElements} bài)
              </CardTitle>
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={refetch}
                  >
                    Thử lại
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Questions Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  {questions.map((question) => (
                    <Card
                      key={question.id}
                      className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-l-4 border-l-primary"
                      onClick={() =>
                        handleQuestionClick(question.id, question.title)
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {question.questionCode}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getTypeColor(
                                  question.type
                                )} border-0`}
                              >
                                {question.type}
                              </Badge>
                              <span
                                className={`text-xs font-medium ${getLevelColor(
                                  question.level
                                )}`}
                              >
                                {question.level}
                              </span>
                            </div>

                            <h3 className="font-medium text-base mb-2 line-clamp-2">
                              {question.title}
                            </h3>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                <span>{question.point} điểm</span>
                              </div>
                              {question.status && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getStatusColor(
                                    question.status
                                  )} border-0`}
                                >
                                  {question.status}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-shrink-0"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Bắt đầu
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Trang {currentPage + 1} / {totalPages} ({totalElements}{" "}
                      bài tập)
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.max(0, currentPage - 1))
                        }
                        disabled={currentPage === 0 || loading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(
                            Math.min(totalPages - 1, currentPage + 1)
                          )
                        }
                        disabled={currentPage >= totalPages - 1 || loading}
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
