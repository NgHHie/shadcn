// src/components/editor/dashboard-controls.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Play, Send, Loader2 } from "lucide-react";
import { QuestionDetail } from "@/lib/api";

interface DashboardControlsProps {
  isMobile: boolean;
  isRunning: boolean;
  handleRunQuery: () => void;
  isSubmitting: boolean;
  submitSolution: () => void;
  question: QuestionDetail | null | undefined;
  sqlQuery: string;
  selectedDatabase: string;
}

export function DashboardControls({
  isMobile,
  isRunning,
  handleRunQuery,
  isSubmitting,
  submitSolution,
  question,
  sqlQuery,
  selectedDatabase,
}: DashboardControlsProps) {
  const isDisabled = !question || !sqlQuery.trim() || !selectedDatabase;

  return (
    <div
      className={`flex items-center gap-2 border-b p-2 bg-muted/10 flex-shrink-0 ${
        isMobile ? "flex-wrap" : ""
      }`}
    >
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="outline"
          size="sm"
          className={`gap-1 ${isMobile ? "text-xs h-7" : ""}`}
          onClick={handleRunQuery}
          disabled={isRunning || isDisabled}
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span className={`${isMobile ? "text-xs" : "text-sm"}`}>
            {isRunning ? "Running..." : "Run"}
          </span>
        </Button>

        <Button
          size="sm"
          className={`gap-1 ${isMobile ? "text-xs h-7" : ""}`}
          onClick={submitSolution}
          disabled={isSubmitting || isDisabled}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className={`${isMobile ? "text-xs" : "text-sm"}`}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </span>
        </Button>
      </div>

      {/* Keyboard shortcut hint */}
      {!isMobile && (
        <div className="text-xs text-muted-foreground ml-2">
          Ctrl + Enter để chạy
        </div>
      )}
    </div>
  );
}
