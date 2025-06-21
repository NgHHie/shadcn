// src/types/question.ts - Updated type definitions

// Enums from backend
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

// Filter criteria matching backend QuestionFilterCriteria
export interface QuestionFilterCriteria {
  keyword?: string; // Search in all fields
  questionCode?: string; // Specific question code
  title?: string; // Search in title
  type?: TypeQuestion; // Question type filter
  level?: LevelQuestion; // Difficulty level filter
}

// Pagination parameters
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string[];
}

// Updated Question types to match the new API response
export interface QuestionListItem {
  id: string;
  questionCode: string;
  title: string;
  content?: string;
  type: TypeQuestion;
  level: LevelQuestion;
  point: number;
  enable: boolean;
  totalSub?: number;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  // Runtime added fields
  status?: "AC" | "WA" | "TLE" | "CE" | "Not Started";
}

// API Response structure for search endpoint
export interface QuestionSearchResponse {
  content: QuestionListItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Filter options for UI components
export interface FilterOption<T> {
  value: T;
  label: string;
  color?: string;
}

export const TYPE_OPTIONS: FilterOption<TypeQuestion>[] = [
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

export const LEVEL_OPTIONS: FilterOption<LevelQuestion>[] = [
  { value: "EASY", label: "Dễ", color: "bg-green-100 text-green-800" },
  {
    value: "MEDIUM",
    label: "Trung bình",
    color: "bg-yellow-100 text-yellow-800",
  },
  { value: "HARD", label: "Khó", color: "bg-red-100 text-red-800" },
];

// Helper functions
export const getLevelLabel = (level: LevelQuestion): string => {
  const option = LEVEL_OPTIONS.find((opt) => opt.value === level);
  return option?.label || level;
};

export const getLevelColor = (level: LevelQuestion): string => {
  const option = LEVEL_OPTIONS.find((opt) => opt.value === level);
  return option?.color || "bg-gray-100 text-gray-800";
};

export const getTypeLabel = (type: TypeQuestion): string => {
  const option = TYPE_OPTIONS.find((opt) => opt.value === type);
  return option?.label || type;
};
