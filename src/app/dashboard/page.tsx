import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive";
import { QuestionCard } from "@/components/dashboard/question-card";
import { Pagination } from "@/components/dashboard/pagination";
import { useQuestions } from "@/hooks/use-questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, AlertCircle } from "lucide-react";
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

      {/* Search */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Tìm kiếm bài tập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo mã câu hỏi hoặc tên đề bài..."
                    value={inputKeyword}
                    onChange={(e) => setInputKeyword(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={loading}>
                  Tìm kiếm
                </Button>

                {searchKeyword && (
                  <Button
                    variant="outline"
                    onClick={handleClearSearch}
                    disabled={loading}
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
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
                {questions.length > 0 ? (
                  <div className="grid gap-4">
                    {questions.map((question) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        onClick={handleQuestionClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {searchKeyword
                        ? `Không tìm thấy bài tập nào với từ khóa "${searchKeyword}"`
                        : "Không có bài tập nào"}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  loading={loading}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
