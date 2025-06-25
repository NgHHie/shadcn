// src/components/editor/sidebar-panel.tsx (Refactored)
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BookOpen } from "lucide-react";
import { QuestionDetail } from "@/lib/api";
import { useNavigate } from "react-router-dom";

// Import the new tab components
import { AssignmentTab } from "./assignment-tab";

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
        </div>
      </Tabs>
    </div>
  );
}
