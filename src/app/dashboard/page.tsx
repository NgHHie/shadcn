import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { QuestionCard } from "@/components/dashboard/question-card";
import { Pagination } from "@/components/dashboard/pagination";
import { useQuestions } from "@/hooks/use-questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Loader2, AlertCircle, BookOpen, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toastSuccess } from "@/lib/toast";

export function Page() {
  const navigate = useNavigate();
  const [inputKeyword, setInputKeyword] = useState(""); // Input state
  const [searchKeyword, setSearchKeyword] = useState(""); // Actual search keyword
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Sử dụng keyword parameter thay vì search
  const { questions, loading, error, totalPages, totalElements, refetch } =
    useQuestions({
      page: currentPage,
      size: pageSize,
      keyword: searchKeyword || undefined, // Dùng keyword parameter
    });

  const handleSearch = useCallback(() => {
    setSearchKeyword(inputKeyword.trim());
    setCurrentPage(0);
  }, [inputKeyword]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleQuestionClick = useCallback(
    (questionId: string, questionTitle: string) => {
      toastSuccess("Chuyển đến đề bài", {
        description: `Đang mở: ${questionTitle}`,
      });
      navigate(`/question-detail/${questionId}`);
    },
    [navigate]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleClearSearch = useCallback(() => {
    setInputKeyword("");
    setSearchKeyword("");
    setCurrentPage(0);
  }, []);

  // Render questions content với logic loading state đúng
  const renderQuestionsContent = () => {
    // 1. Loading state - hiển thị skeleton
    if (loading) {
      return (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-64" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </div>
      );
    }

    // 2. Error state - hiển thị lỗi
    if (error) {
      return (
        <Alert variant="destructive">
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
      );
    }

    // 3. Empty state - chỉ hiển thị khi !loading && questions.length === 0
    if (!loading && questions.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchKeyword ? "Không tìm thấy kết quả" : "Không có bài tập nào"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchKeyword
              ? `Không tìm thấy bài tập nào với từ khóa "${searchKeyword}"`
              : "Hiện tại chưa có bài tập nào được phân công cho bạn"}
          </p>
          {searchKeyword && (
            <Button variant="outline" onClick={handleClearSearch}>
              Xóa bộ lọc
            </Button>
          )}
        </div>
      );
    }

    // 4. Success state - hiển thị danh sách câu hỏi
    return (
      <>
        <div className="grid gap-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onClick={handleQuestionClick}
            />
          ))}
        </div>

        {/* Pagination - chỉ hiển thị khi có dữ liệu */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            loading={loading}
            onPageChange={handlePageChange}
          />
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Stats Chart */}
      {/* <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div> */}

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

      {/* Questions List */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Bên trái: Tiêu đề */}
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">
                  Bài tập {!loading && `(${totalElements} bài)`}
                </CardTitle>
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Bên phải: Search + Button */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                {/* Input có độ rộng hợp lý ở laptop */}
                <div className="relative w-full sm:w-[320px]">
                  {/* Icon Search bên trái */}
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  {/* Input */}
                  <Input
                    placeholder="Tìm kiếm theo mã hoặc tên câu hỏi..."
                    value={inputKeyword}
                    onChange={(e) => setInputKeyword(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="pl-10 pr-10 w-full"
                  />

                  {/* Nút X xoá từ khoá */}
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Xoá bộ lọc"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Nút tìm kiếm và xóa */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    Tìm kiếm
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>{renderQuestionsContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
