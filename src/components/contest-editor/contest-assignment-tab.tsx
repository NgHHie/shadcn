// src/components/contest-editor/contest-assignment-tab.tsx
"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, Trophy } from "lucide-react";
import { QuestionDetail } from "@/lib/api";

interface ContestAssignmentTabProps {
  question?: QuestionDetail | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function ContestAssignmentTab({
  question,
  loading,
  error,
  onRetry,
}: ContestAssignmentTabProps) {
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

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="ml-2"
              >
                Thử lại
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Không có dữ liệu câu hỏi</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Question Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">{question.title}</h2>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Badge variant="outline">#{question.questionCode}</Badge>
            <Badge className={getLevelColor(question.level)}>
              {question.level}
            </Badge>
            <Badge variant="secondary">{question.point} điểm</Badge>
            <Badge variant="outline">{question.type}</Badge>
          </div>
        </div>

        {/* Question Content */}
        <div className="space-y-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: question.content }}
              className="leading-relaxed"
            />
          </div>
        </div>

        {/* Database Info */}
        {question.questionDetails && question.questionDetails.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database hỗ trợ
            </h3>
            <div className="grid gap-2">
              {question.questionDetails.map((detail) => (
                <div
                  key={detail.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="font-medium">
                    {detail.typeDatabase.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Hỗ trợ
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prefix Code */}
        {question.prefixCode && (
          <div className="space-y-3">
            <h3 className="font-semibold">Code mẫu</h3>
            <div className="p-3 bg-muted rounded-lg">
              <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                {question.prefixCode}
              </pre>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
