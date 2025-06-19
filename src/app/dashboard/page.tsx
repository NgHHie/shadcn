import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionCard } from "@/components/dashboard/question-card";
import { Pagination } from "@/components/dashboard/pagination";
import { useQuestions } from "@/hooks/use-questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Loader2, AlertCircle, BookOpen, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toastSuccess } from "@/lib/toast";

export function Page() {
  const navigate = useNavigate();
  const [inputKeyword, setInputKeyword] = useState(""); // Input state
  const [searchKeyword, setSearchKeyword] = useState(""); // Actual search keyword
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Sử dụng keyword parameter thay vì search
  const { questions, loading, error, totalPages, totalElements, refetch } =
    useQuestions({
      page: currentPage,
      size: pageSize,
      keyword: searchKeyword || undefined,
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

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset về trang đầu khi thay đổi page size
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
        <div className="grid gap-1">
          {Array.from({ length: pageSize }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
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
        <div className="grid gap-1">
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
            pageSize={pageSize}
            loading={loading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-2 py-2 md:gap-3 md:py-3">
      {/* Questions List - Bỏ Card wrapper */}
      <div className="px-4 lg:px-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          {/* Bên trái: Tiêu đề */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              DANH SÁCH BÀI TẬP {!loading && `(${totalElements} bài)`}
            </h1>
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
                className="pl-10 pr-10"
                disabled={loading}
              />

              {/* Clear button - chỉ hiển thị khi có text */}
              {inputKeyword && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setInputKeyword("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Content */}
        {renderQuestionsContent()}
      </div>
    </div>
  );
}
