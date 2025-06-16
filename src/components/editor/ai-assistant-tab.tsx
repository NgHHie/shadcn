// src/components/editor/ai-assistant-tab.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bot, ArrowUp, Paperclip } from "lucide-react";
import { toastSuccess, toastInfo } from "@/lib/toast";
import { QuestionDetail } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiAssistantTabProps {
  question?: QuestionDetail | null;
}

export function AiAssistantTab({ question }: AiAssistantTabProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Xin chào! Tôi có thể giúp gì cho bạn với bài tập SQL này?",
    },
  ]);

  const messagesRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages((prev) => [...prev, { role: "user", content: inputValue }]);

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

      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Container */}
      <div ref={messagesRef} className="flex-1 p-4 overflow-y-auto min-h-0">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === "assistant" ? "bg-muted" : "bg-primary/10 ml-8"
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
              <p className="text-sm text-foreground">{message.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t p-3 bg-background flex-shrink-0">
        <div className="flex items-center bg-muted rounded-lg px-3 py-2 gap-2">
          <input
            type="text"
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-0"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
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
  );
}
