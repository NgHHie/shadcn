// src/components/editor/sidebar-panel.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, BookOpen, Bot, Paperclip, ArrowUp } from "lucide-react";
import { QuestionSelector } from "@/components/editor/question-selector";

// Import data từ file JSON
import questionsData from "./data/questions-data.json";

interface Question {
  id: number;
  title: string;
  status: "AC" | "WA" | "TLE" | "Not Started";
  difficulty: "Easy" | "Medium" | "Hard";
  type: string;
  category: string;
  tags: string[];
  code: string;
  description: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SidebarPanelProps {
  onQuestionChange?: (question: Question) => void;
}

export function SidebarPanel({ onQuestionChange }: SidebarPanelProps) {
  const [activeTab, setActiveTab] = useState("assignment");
  const [inputValue, setInputValue] = useState("");
  const [currentQuestionId, setCurrentQuestionId] = useState(1); // Default to first question
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Xin chào! Tôi có thể giúp gì cho bạn với bài tập SQL này?",
    },
  ]);

  // Cast imported data to proper type
  const questions: Question[] = questionsData as Question[];

  // Set initial question
  useEffect(() => {
    const initialQuestion = questions.find((q) => q.id === currentQuestionId);
    if (initialQuestion) {
      setCurrentQuestion(initialQuestion);
    }
  }, []);

  const handleQuestionChange = (question: Question) => {
    setCurrentQuestionId(question.id);
    setCurrentQuestion(question);
    if (onQuestionChange) {
      onQuestionChange(question);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { role: "user", content: inputValue }]);
      // Simulate AI response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Tôi đã xem qua truy vấn SQL của bạn. Bạn đang truy xuất dữ liệu cơ hội bán hàng trong 2 tháng qua, được nhóm theo ngày, tuần và chủ sở hữu. Bạn có cần giải thích thêm về cách truy vấn này hoạt động không?",
          },
        ]);
      }, 1000);
      setInputValue("");
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "SELECT":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
      case "INSERT":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
      case "UPDATE":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
      case "DELETE":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      case "CREATE":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200";
      case "PROCEDURE":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200";
      case "INDEX":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600 dark:text-green-400";
      case "Medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "Hard":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-r w-full overflow-hidden">
      <Tabs
        defaultValue="assignment"
        className="flex-1 flex flex-col h-full overflow-hidden"
      >
        <div className="border-b flex-shrink-0 bg-background">
          <TabsList className="w-full justify-start p-0 h-auto bg-transparent">
            <TabsTrigger
              value="assignment"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2 text-foreground"
              onClick={() => setActiveTab("assignment")}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Đề bài
            </TabsTrigger>
            <TabsTrigger
              value="discussion"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2 text-foreground"
              onClick={() => setActiveTab("discussion")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Bàn luận
            </TabsTrigger>
            <TabsTrigger
              value="assistant"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2 text-foreground"
              onClick={() => setActiveTab("assistant")}
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Đề bài */}
        <TabsContent value="assignment" className="flex-1 p-4 m-0 h-full">
          <div className="flex-1 pb-2 overflow-auto h-full">
            <div className="pb-8 space-y-4">
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1 text-foreground truncate">
                    {currentQuestion?.title || "Chọn câu hỏi"}
                  </h3>

                  {/* Question metadata - Type and Difficulty only */}
                  {currentQuestion && (
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-1 font-mono font-semibold ${getTypeColor(
                          currentQuestion.type
                        )} border-0`}
                      >
                        {currentQuestion.type}
                      </Badge>
                      <span
                        className={`text-sm font-medium ${getDifficultyColor(
                          currentQuestion.difficulty
                        )}`}
                      >
                        {currentQuestion.difficulty}
                      </span>
                    </div>
                  )}
                </div>

                <QuestionSelector
                  currentQuestionId={currentQuestionId}
                  onQuestionChange={handleQuestionChange}
                />
              </div>

              {/* Question description */}
              <div className="prose prose-sm max-w-none">
                <p className="text-sm mb-4 text-foreground whitespace-pre-line leading-relaxed">
                  {currentQuestion?.description ||
                    `Sử dụng SQL để phân tích dữ liệu cơ hội bán hàng trong 2 tháng qua. Truy vấn cần trả về các thông tin sau:

• Ngày tạo cơ hội (theo ngày)
• Ngày tạo cơ hội (theo tuần)
• Ngày trong tuần
• Chủ sở hữu cơ hội
• Trạng thái cơ hội
• Tổng giá trị cơ hội
• Số lượng cơ hội

Kết quả cần được nhóm theo ngày, tuần và chủ sở hữu để phân tích hiệu suất bán hàng.`}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab Bàn luận */}
        <TabsContent value="discussion" className="flex-1 p-4 m-0 h-full">
          <div className="flex-1 pb-2 overflow-auto h-[calc(100%-60px)]">
            <div className="pb-8 space-y-2">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1 text-foreground">
                  Nguyễn Văn A
                </p>
                <p className="text-sm text-muted-foreground">
                  Tôi đang gặp vấn đề với hàm DATE_TRUNC, nó không hoạt động
                  trong MySQL. Có ai biết cách thay thế không?
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1 text-foreground">
                  Trần Thị B
                </p>
                <p className="text-sm text-muted-foreground">
                  Trong MySQL bạn có thể dùng DATE_FORMAT hoặc YEARWEEK để nhóm
                  theo tuần. Ví dụ: DATE_FORMAT(created_date, '%Y-%m-%d')
                </p>
              </div>
            </div>
          </div>
          <div className="border-t py-3 mt-auto bg-background sticky bottom-0">
            <div className="flex items-center bg-muted rounded-lg px-3 py-2">
              <input
                type="text"
                placeholder="Nhập bình luận..."
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                onClick={handleSendMessage}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab AI Assistant */}
        <TabsContent
          value="assistant"
          className="flex-1 flex flex-col m-0 p-0 h-full"
        >
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.role === "assistant"
                      ? "bg-muted"
                      : "bg-primary/10 ml-8"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center mb-1">
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground mr-2">
                        <Bot className="h-3 w-3" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        AI Assistant
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-foreground">{message.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t p-3 mt-auto bg-background">
            <div className="flex items-center bg-muted rounded-lg px-3 py-2">
              <input
                type="text"
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                onClick={handleSendMessage}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
