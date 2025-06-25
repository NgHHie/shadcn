// src/components/contest-editor/contest-sidebar.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen } from "lucide-react";
import { QuestionDetail } from "@/lib/api";
import { ContestAssignmentTab } from "./contest-assignment-tab";

interface ContestSidebarProps {
  question?: QuestionDetail | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  contestId: string;
  outerQuestionId: string;
}

export function ContestSidebar({
  question,
  loading,
  error,
  onRetry,
  contestId,
  outerQuestionId,
}: ContestSidebarProps) {
  const [activeTab, setActiveTab] = useState("assignment");

  return (
    <div className="h-full flex flex-col bg-background border-l">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Contest</h3>
            {question && (
              <span className="text-sm text-muted-foreground">
                #{question.questionCode}
              </span>
            )}
          </div>
        </div>

        {/* Tabs - chỉ có Assignment tab */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full h-auto p-1 bg-transparent">
            <TabsTrigger
              value="assignment"
              className="flex-1 gap-2 data-[state=active]:bg-background"
            >
              <BookOpen className="h-4 w-4" />
              Đề bài
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="assignment" className="h-full m-0">
            <ContestAssignmentTab
              question={question}
              loading={loading}
              error={error}
              onRetry={onRetry}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
