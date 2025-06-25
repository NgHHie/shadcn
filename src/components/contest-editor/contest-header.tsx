// src/components/contest-editor/contest-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { QuestionDetail } from "@/lib/api";

interface ContestHeaderProps {
  question?: QuestionDetail | null;
  toggleHistory: () => void;
  historyLoading: boolean;
}

export function ContestHeader({
  question,
  toggleHistory,
  historyLoading,
}: ContestHeaderProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "EASY":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
      case "HARD":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="flex-shrink-0 border-b">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Contest Editor</h2>
          {question && (
            <>
              <span className="text-sm text-muted-foreground">
                #{question.questionCode}
              </span>
              <Badge className={getLevelColor(question.level)}>
                {question.level}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {question.point} điểm
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleHistory}
            disabled={historyLoading}
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
      </div>
    </div>
  );
}
