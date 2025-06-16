// src/components/editor/sidebar-panel.tsx (Refactored)
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BookOpen } from "lucide-react";
import { QuestionDetail } from "@/lib/api";
import { useNavigate } from "react-router-dom";

// Import the new tab components
import { AssignmentTab } from "./assignment-tab";
import { DiscussionTab } from "./discussion-tab";

interface SidebarPanelProps {
  question?: QuestionDetail | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onQuestionChange?: (question: QuestionDetail) => void;
}

export function SidebarPanel({
  question,
  loading,
  error,
  onRetry,
}: SidebarPanelProps) {
  const navigate = useNavigate();
  const [, setActiveTab] = useState("assignment");

  // Handle question selection from dropdown
  const handleQuestionSelect = (questionId: string) => {
    navigate(`/question-detail/${questionId}`);
  };

  return (
    <div className="flex flex-col h-full bg-background border-r w-full">
      <Tabs
        defaultValue="assignment"
        className="flex-1 flex flex-col h-full"
        onValueChange={setActiveTab}
      >
        {/* Tab Headers - Fixed */}
        <div className="border-b flex-shrink-0 bg-background">
          <TabsList className="w-full justify-start p-0 h-auto bg-transparent">
            <TabsTrigger
              value="assignment"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2 text-foreground"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Đề bài
            </TabsTrigger>
            <TabsTrigger
              value="discussion"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2 text-foreground"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Bàn luận
            </TabsTrigger>
            {/* <TabsTrigger
              value="assistant"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2 text-foreground"
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger> */}
          </TabsList>
        </div>

        {/* Tab Content - Flexible */}
        <div className="flex-1 min-h-0">
          {/* Assignment Tab */}
          <TabsContent value="assignment" className="flex-1 h-full m-0">
            <AssignmentTab
              question={question}
              loading={loading}
              error={error}
              onRetry={onRetry}
              onQuestionChange={handleQuestionSelect}
            />
          </TabsContent>

          {/* Discussion Tab */}
          <TabsContent value="discussion" className="flex-1 h-full m-0">
            <DiscussionTab questionId={question?.id} />
          </TabsContent>

          {/* AI Assistant Tab */}
          {/* <TabsContent value="assistant" className="flex-1 h-full m-0">
            <AiAssistantTab question={question} />
          </TabsContent> */}
        </div>
      </Tabs>
    </div>
  );
}
