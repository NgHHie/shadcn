// src/components/editor/sidebar-panel.tsx
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  BookOpen,
  Bot,
  Paperclip,
  ArrowUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toastSuccess, toastInfo, toastError } from "@/lib/toast";
import { QuestionDetail } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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
  onQuestionChange,
}: SidebarPanelProps) {
  const [activeTab, setActiveTab] = useState("assignment");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Xin chào! Tôi có thể giúp gì cho bạn với bài tập SQL này?",
    },
  ]);

  // Refs for auto-scrolling
  const discussionMessagesRef = useRef<HTMLDivElement>(null);
  const assistantMessagesRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (activeTab === "discussion" && discussionMessagesRef.current) {
      discussionMessagesRef.current.scrollTop =
        discussionMessagesRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  useEffect(() => {
    if (activeTab === "assistant" && assistantMessagesRef.current) {
      assistantMessagesRef.current.scrollTop =
        assistantMessagesRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSendMessage = useCallback(() => {
    if (inputValue.trim()) {
      setMessages((prev) => [...prev, { role: "user", content: inputValue }]);

      if (activeTab === "discussion") {
        toastInfo("Đã gửi bình luận");
      } else if (activeTab === "assistant") {
        toastInfo("Đã gửi tin nhắn cho AI");

        // Simulate AI response
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Tôi đã xem qua câu hỏi của bạn. Đây là một bài tập về " +
                (question?.type || "SQL") +
                ". " +
                "Bạn cần viết truy vấn để " +
                (question?.title || "giải quyết bài toán này") +
                ". " +
                "Bạn có cần giải thích thêm về cách tiếp cận không?",
            },
          ]);

          toastSuccess("AI đã trả lời!");
        }, 1000);
      }

      setInputValue("");
    } else {
      toastError("Tin nhắn trống");
    }
  }, [inputValue, activeTab, question?.type, question?.title]);

  // Memoize color functions to prevent recalculation
  const getTypeColor = useCallback((type: string) => {
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
  }, []);

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-green-600 dark:text-green-400";
      case "MEDIUM":
        return "text-yellow-600 dark:text-yellow-400";
      case "HARD":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  }, []);

  // Memoize parsed HTML content to prevent re-parsing
  const parsedContent = useMemo(() => {
    if (!question?.content) {
      return `Vui lòng chọn một câu hỏi từ danh sách để bắt đầu luyện tập SQL.

Bạn có thể:
• Xem đề bài chi tiết
• Viết và chạy thử SQL
• Nộp bài để kiểm tra kết quả
• Trao đổi với cộng đồng
• Nhận hỗ trợ từ AI Assistant`;
    }

    return question.content; // Return raw HTML content
  }, [question?.content]);

  // Function to render HTML content safely
  const renderHTMLContent = (htmlContent: string) => {
    // Decode Unicode characters
    const decodedContent = htmlContent.replace(
      /\\u([0-9A-Fa-f]{4})/g,
      (match, code) => String.fromCharCode(parseInt(code, 16))
    );

    return (
      <div
        className="prose-question-content"
        dangerouslySetInnerHTML={{ __html: decodedContent }}
      />
    );
  };

  // Memoize question metadata
  const questionMetadata = useMemo(() => {
    if (!question) return null;

    return (
      <div className="flex items-center gap-2 mb-3">
        <Badge
          variant="outline"
          className={`text-xs px-2 py-1 font-medium ${getTypeColor(
            question.type
          )} border-0`}
        >
          {question.type}
        </Badge>
        <span
          className={`text-sm font-medium ${getDifficultyColor(
            question.level
          )}`}
        >
          {question.level}
        </span>
        <span className="text-sm text-muted-foreground">
          {question.point} điểm
        </span>
      </div>
    );
  }, [question, getTypeColor, getDifficultyColor]);

  // Memoize additional info
  const additionalInfo = useMemo(() => {
    if (!question) return null;

    return (
      <div className="mt-6 p-3 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2 text-foreground">
          Thông tin thêm:
        </h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>Mã câu hỏi: {question.questionCode}</p>
          <p>
            Loại cơ sở dữ liệu:{" "}
            {question.questionDetails?.[0]?.typeDatabase?.name || "MySQL"}
          </p>
          <p>
            Cập nhật lần cuối:{" "}
            {new Date(question.lastModifiedAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>
    );
  }, [question]);

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
            <TabsTrigger
              value="assistant"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2 text-foreground"
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content - Flexible */}
        <div className="flex-1 min-h-0">
          {/* Tab Đề bài */}
          <TabsContent value="assignment" className="flex-1 h-full m-0">
            <div className="h-full flex flex-col">
              <div className="flex-1 p-4 overflow-auto">
                {loading ? (
                  // Loading state chỉ hiển thị ở phần đề bài
                  <div className="flex items-center justify-center min-h-[200px]">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Đang tải đề bài...
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  // Error state chỉ hiển thị ở phần đề bài
                  <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                    <Alert className="max-w-md">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>

                    {onRetry && (
                      <Button onClick={onRetry} size="sm">
                        Thử lại
                      </Button>
                    )}
                  </div>
                ) : (
                  // Normal content
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-lg mb-1 text-foreground truncate">
                          {question?.questionCode || "SQL001"}:{" "}
                          {question?.title || "Chưa có đề bài"}
                        </h3>

                        {/* Question metadata */}
                        {questionMetadata}
                      </div>
                    </div>

                    {/* Question description */}
                    <div className="prose prose-sm max-w-none">
                      {question?.content ? (
                        renderHTMLContent(parsedContent)
                      ) : (
                        <div className="text-sm mb-4 text-foreground whitespace-pre-line leading-relaxed">
                          {parsedContent}
                        </div>
                      )}
                    </div>

                    {/* Additional question info */}
                    {additionalInfo}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tab Bàn luận */}
          <TabsContent value="discussion" className="flex-1 h-full m-0">
            <div className="h-full flex flex-col">
              {/* Messages Container - Flexible height */}
              <div
                ref={discussionMessagesRef}
                className="flex-1 p-4 overflow-y-auto min-h-0"
              >
                <div className="space-y-3">
                  {/* Static discussion messages */}
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1 text-foreground">
                      Nguyễn Văn A
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Bài này có thể dùng JOIN để kết nối các bảng không? Tôi
                      đang gặp khó khăn với phần GROUP BY.
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1 text-foreground">
                      Trần Thị B
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Bạn có thể sử dụng LEFT JOIN hoặc INNER JOIN tùy vào yêu
                      cầu. Với GROUP BY, hãy chú ý các cột trong SELECT phải có
                      trong GROUP BY hoặc là aggregate function.
                    </p>
                  </div>

                  {/* Dynamic messages from user input */}
                  {messages
                    .filter((_, index) => index > 0) // Skip initial AI message
                    .map((message, index) => (
                      <div key={index} className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1 text-foreground">
                          {message.role === "user" ? "Bạn" : "AI Assistant"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {message.content}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Input Area - Fixed at bottom */}
              <div className="border-t p-3 bg-background flex-shrink-0">
                <div className="flex items-center bg-muted rounded-lg px-3 py-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nhập bình luận..."
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-0"
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
                    className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 flex-shrink-0"
                    onClick={handleSendMessage}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab AI Assistant */}
          <TabsContent value="assistant" className="flex-1 h-full m-0">
            <div className="h-full flex flex-col">
              {/* Messages Container - Flexible height */}
              <div
                ref={assistantMessagesRef}
                className="flex-1 p-4 overflow-y-auto min-h-0"
              >
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
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground mr-2 flex-shrink-0">
                            <Bot className="h-3 w-3" />
                          </div>
                          <p className="text-sm font-medium text-foreground">
                            AI Assistant
                          </p>
                        </div>
                      )}
                      <p className="text-sm text-foreground">
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Area - Fixed at bottom */}
              <div className="border-t p-3 bg-background flex-shrink-0">
                <div className="flex items-center bg-muted rounded-lg px-3 py-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nhập câu hỏi của bạn..."
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-0"
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
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                  >
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 flex-shrink-0"
                    onClick={handleSendMessage}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
