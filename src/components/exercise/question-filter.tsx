// src/components/exercise/question-filter.tsx
import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types từ backend
export type TypeQuestion =
  | "SELECT"
  | "INSERT"
  | "UPDATE"
  | "DELETE"
  | "DROP"
  | "CREATE"
  | "ALTER"
  | "PROCEDURE"
  | "TRIGGER"
  | "TRUNCATE";

export type LevelQuestion = "EASY" | "MEDIUM" | "HARD";

export interface QuestionFilterCriteria {
  keyword?: string;
  questionCode?: string;
  title?: string;
  type?: TypeQuestion;
  level?: LevelQuestion;
}

interface QuestionFilterProps {
  onFilter: (criteria: QuestionFilterCriteria) => void;
  loading?: boolean;
  className?: string;
}

// Constants cho dropdown options
const TYPE_OPTIONS: { value: TypeQuestion; label: string }[] = [
  { value: "SELECT", label: "SELECT" },
  { value: "INSERT", label: "INSERT" },
  { value: "UPDATE", label: "UPDATE" },
  { value: "DELETE", label: "DELETE" },
  { value: "CREATE", label: "CREATE" },
  { value: "ALTER", label: "ALTER" },
  { value: "DROP", label: "DROP" },
  { value: "PROCEDURE", label: "PROCEDURE" },
  { value: "TRIGGER", label: "TRIGGER" },
  { value: "TRUNCATE", label: "TRUNCATE" },
];

const LEVEL_OPTIONS: { value: LevelQuestion; label: string; color: string }[] =
  [
    { value: "EASY", label: "Easy", color: "" },
    {
      value: "MEDIUM",
      label: "Medium",
      color: "",
    },
    { value: "HARD", label: "Hard", color: "" },
  ];

export function QuestionFilter({
  onFilter,
  loading,
  className,
}: QuestionFilterProps) {
  const { t } = useTranslation("exercise");
  const [searchInput, setSearchInput] = useState("");
  const [selectedType, setSelectedType] = useState<TypeQuestion | "ALL">("ALL");
  const [selectedLevel, setSelectedLevel] = useState<LevelQuestion | "ALL">(
    "ALL"
  );

  // Handle search
  const handleSearch = useCallback(() => {
    const criteria: QuestionFilterCriteria = {};

    // Nếu có input, sử dụng keyword để tìm trong cả mã và tiêu đề
    if (searchInput.trim()) {
      criteria.keyword = searchInput.trim();
    }

    // Thêm type filter nếu được chọn
    if (selectedType !== "ALL") {
      criteria.type = selectedType;
    }

    // Thêm level filter nếu được chọn
    if (selectedLevel !== "ALL") {
      criteria.level = selectedLevel;
    }

    onFilter(criteria);
  }, [searchInput, selectedType, selectedLevel, onFilter]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Clear all filters
  const handleClearAll = useCallback(() => {
    setSearchInput("");
    setSelectedType("ALL");
    setSelectedLevel("ALL");
    onFilter({});
  }, [onFilter]);

  // Check if any filter is active
  const hasActiveFilters =
    searchInput.trim() || selectedType !== "ALL" || selectedLevel !== "ALL";

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Main filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-9 pr-10"
            disabled={loading}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Type Dropdown */}
        <div className="min-w-[160px]">
          <Select
            value={selectedType}
            onValueChange={(value) =>
              setSelectedType(value as TypeQuestion | "ALL")
            }
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("questionCard.category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t("questionCard.allCategories")}
              </SelectItem>
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Level Dropdown */}
        <div className="min-w-[140px]">
          <Select
            value={selectedLevel}
            onValueChange={(value) =>
              setSelectedLevel(value as LevelQuestion | "ALL")
            }
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("questionCard.difficulty")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t("questionCard.allDifficulties")}
              </SelectItem>
              {LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">{option.label}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch} disabled={loading} className="shrink-0">
          {t("filter.search")}
        </Button>

        {/* Clear Button - chỉ hiển thị khi có filter */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearAll}
            disabled={loading}
            className="shrink-0"
          >
            {t("filter.clearFilter")}
          </Button>
        )}
      </div>
    </div>
  );
}
