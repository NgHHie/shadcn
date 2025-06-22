// src/app/exercise/page.tsx - Updated with new filter component
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { QuestionCard } from "@/components/exercise/question-card";
import { Pagination } from "@/components/exercise/pagination";
import {
  QuestionFilter,
  QuestionFilterCriteria,
} from "@/components/exercise/question-filter";
import { useQuestions } from "@/hooks/use-questions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toastSuccess } from "@/lib/toast";

export function Page() {
  const { t } = useTranslation("exercise");

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filterCriteria, setFilterCriteria] = useState<QuestionFilterCriteria>(
    {}
  );

  // Use new hook with filter support
  const {
    questions,
    loading,
    error,
    totalPages,
    totalElements,
    searchWithFilter,
    changePage,
    changePageSize,
  } = useQuestions({
    pagination: {
      page: currentPage,
      size: pageSize,
      sort: ["createdAt,desc"], // Sort by creation date, newest first
    },
    criteria: filterCriteria,
    autoFetch: true,
  });

  // Handle filter changes
  const handleFilter = useCallback(
    (criteria: QuestionFilterCriteria) => {
      setFilterCriteria(criteria);
      setCurrentPage(0); // Reset to first page when filtering
      searchWithFilter(criteria, { page: 0, size: pageSize });
    },
    [searchWithFilter, pageSize]
  );

  // Handle question click
  const handleQuestionClick = useCallback(
    (questionId: string, questionTitle: string) => {
      toastSuccess(t("redirectingToAssignment"), {
        description: t("openingAssignment", { title: questionTitle }),
      });
      navigate(`/question-detail/${questionId}`);
    },
    [navigate, t]
  );

  // Handle page changes
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      changePage(page);
    },
    [changePage]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      setCurrentPage(0);
      changePageSize(newPageSize);
    },
    [changePageSize]
  );

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    const emptyCriteria: QuestionFilterCriteria = {};
    setFilterCriteria(emptyCriteria);
    setCurrentPage(0);
    searchWithFilter(emptyCriteria, { page: 0, size: pageSize });
  }, [searchWithFilter, pageSize]);

  // Check if any filters are active
  const hasActiveFilters = Object.values(filterCriteria).some(
    (value) => value !== undefined && value !== ""
  );

  // Render loading skeletons
  const renderLoadingSkeletons = () => (
    <div className="grid gap-2">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="border rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );

  // Render questions content
  const renderQuestionsContent = () => {
    // 1. Loading state
    if (loading) {
      return renderLoadingSkeletons();
    }

    // 2. Error state
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => searchWithFilter(filterCriteria)}
            >
              {t("common.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    // 3. Empty state
    if (!questions || questions.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {hasActiveFilters ? t("noResults") : t("noAssignments")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters
              ? t("noResultsDescription")
              : t("noAssignmentsDescription")}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearAllFilters}>
              {t("filter.clearFilter")}
            </Button>
          )}
        </div>
      );
    }

    // 4. Success state - display questions list
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

        {/* Pagination - only show when there's data */}
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
      {/* Questions List */}
      <div className="px-4 lg:px-6">
        {/* Header section */}
        <div className="flex flex-col gap-4 mb-4">
          {/* Title */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              {t("title")}
              {!loading &&
                " (" + totalElements + " " + t("totalAssignments") + ")"}
            </h1>
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Filter Component */}
          <QuestionFilter
            onFilter={handleFilter}
            loading={loading}
            className="w-full"
          />

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t("filter.activeFilters")}:</span>
              {filterCriteria.keyword && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md">
                  {t("filter.keyword")}: "{filterCriteria.keyword}"
                </span>
              )}
              {filterCriteria.questionCode && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md">
                  {t("filter.code")}: {filterCriteria.questionCode}
                </span>
              )}
              {filterCriteria.title && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md">
                  {t("filter.title")}: "{filterCriteria.title}"
                </span>
              )}
              {filterCriteria.type && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md">
                  {t("filter.type")}: {filterCriteria.type}
                </span>
              )}
              {filterCriteria.level && (
                <span
                  className={`px-2 py-1 bg-gray-100 text-gray-800 rounded-md`}
                >
                  {t("questionCard.difficulty")}:{" "}
                  {filterCriteria.level === "EASY"
                    ? t("questionCard.easy")
                    : filterCriteria.level === "MEDIUM"
                    ? t("questionCard.medium")
                    : t("questionCard.hard")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Questions Content */}
        {renderQuestionsContent()}
      </div>
    </div>
  );
}
