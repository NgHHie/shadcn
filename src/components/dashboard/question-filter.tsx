// src/components/dashboard/question-filter.tsx
import React, { useState, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";

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
    { value: "EASY", label: "Dễ", color: "bg-green-100 text-green-800" },
    {
      value: "MEDIUM",
      label: "Trung bình",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "HARD", label: "Khó", color: "bg-red-100 text-red-800" },
  ];

export function QuestionFilter({
  onFilter,
  loading,
  className,
}: QuestionFilterProps) {
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
            placeholder="Nhập mã hoặc tiêu đề câu hỏi..."
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
              <SelectValue placeholder="Loại câu hỏi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
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
              <SelectValue placeholder="Độ khó" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả độ khó</SelectItem>
              {LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${option.color}`}>
                      {option.label}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch} disabled={loading} className="shrink-0">
          <Search className="h-4 w-4 mr-2" />
          Tìm kiếm
        </Button>

        {/* Clear Button - chỉ hiển thị khi có filter */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearAll}
            disabled={loading}
            className="shrink-0"
          >
            <X className="h-4 w-4 mr-2" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Đang lọc:</span>
          {searchInput.trim() && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              "{searchInput.trim()}"
            </Badge>
          )}
          {selectedType !== "ALL" && (
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-800"
            >
              Loại: {selectedType}
            </Badge>
          )}
          {selectedLevel !== "ALL" && (
            <Badge
              variant="secondary"
              className={
                selectedLevel === "EASY"
                  ? "bg-green-100 text-green-800"
                  : selectedLevel === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }
            >
              Độ khó:{" "}
              {LEVEL_OPTIONS.find((opt) => opt.value === selectedLevel)?.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
