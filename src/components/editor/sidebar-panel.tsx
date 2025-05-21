// src/components/editor/sidebar-panel.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BookOpen, Bot, Paperclip, ArrowUp } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function SidebarPanel() {
  const [activeTab, setActiveTab] = useState("assignment");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Xin chào! Tôi có thể giúp gì cho bạn với bài tập SQL này?",
    },
  ]);

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
              <h3 className="font-bold text-lg mb-2 text-foreground">
                Phân tích dữ liệu bán hàng
              </h3>
              <p className="text-sm mb-4 text-muted-foreground">
                Sử dụng SQL để phân tích dữ liệu cơ hội bán hàng trong 2 tháng
                qua. Truy vấn cần trả về các thông tin sau:Sử dụng SQL để phân
                tích dữ liệu cơ hội bán hàng trong 2 tháng qua. Truy vấn cần trả
                về các thông tin sau:Sử dụng SQL để phân tích dữ liệu cơ hội bán
                hàng trong 2 tháng qua. Truy vấn cần trả về các thông tin sau:Sử
                dụng SQL để phân tích dữ liệu cơ hội bán hàng trong 2 tháng qua.
                Truy vấn cần trả về các thông tin sau:Sử dụng SQL để phân tích
                dữ liệu cơ hội bán hàng trong 2 tháng qua. Truy vấn cần trả về
                các thông tin sau:Sử dụng SQL để phân tích dữ liệu cơ hội bán
                hàng trong 2 tháng qua. Truy vấn cần trả về các thông tin sau:Sử
                dụng SQL để phân tích dữ liệu cơ hội bán hàng trong 2 tháng qua.
                Truy vấn cần trả về các thông tin sau:Sử dụng SQL để phân tích
                dữ liệu cơ hội bán hàng trong 2 tháng qua. Truy vấn cần trả về
                các thông tin sau:Sử dụng SQL để phân tích dữ liệu cơ hội bán
                hàng trong 2 tháng qua. Truy vấn cần trả về các thông tin sau:Sử
                dụng SQL để phân tích dữ liệu cơ hội bán hàng trong 2 tháng qua.
                Truy vấn cần trả về các thông tin sau:Sử dụng SQL để phân tích
                dữ liệu cơ hội bán hàng trong 2 tháng qua. Truy vấn cần trả về
                các thông tin sau:Sử dụng SQL để phân tích dữ liệu cơ hội bán
                hàng trong 2 tháng qua. Truy vấn cần trả về các thông tin sau:Sử
                dụng SQL để phân tích dữ liệu cơ hội bán hàng trong 2 tháng qua.
                Truy vấn cần trả về các thông tin sau:Sử dụng SQL để phân tích
                dữ liệu cơ hội bán hàng trong 2 tháng qua. Truy vấn cần trả về
                các thông tin sau:Sử dụng SQL để phân tích dữ liệu cơ hội bán
                hàng trong 2 tháng qua. Truy vấn cần trả về các thông tin sau:Sử
                dụng SQL để phân tích dữ liệu cơ hội bán hàng trong 2 tháng qua.
                Truy vấn cần trả về các thông tin sau:Sử dụng SQL để phân tích
                dữ liệu cơ hội bán hàng trong 2 tháng qua. Truy vấn cần trả về
                các thông tin sau:Sử dụng SQL để phân tích dữ liệu cơ hội bán
                hàng trong 2 tháng qua. Truy vấn cần trả về các thông tin sau:
              </p>
              <ul className="list-disc pl-5 text-sm space-y-2 mb-4 text-muted-foreground">
                <li>Ngày tạo cơ hội (theo ngày)</li>
                <li>Ngày tạo cơ hội (theo tuần)</li>
                <li>Ngày trong tuần</li>
                <li>Chủ sở hữu cơ hội</li>
                <li>Trạng thái cơ hội</li>
                <li>Tổng giá trị cơ hội</li>
                <li>Số lượng cơ hội</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Kết quả cần được nhóm theo ngày, tuần và chủ sở hữu để phân tích
                hiệu suất bán hàng.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Tab Bàn luận */}
        <TabsContent value="discussion" className="flex-1 p-4 m-0 h-full">
          <div className="flex-1 pb-2 overflow-auto h-full">
            <div className="pb-8 space-y-4">
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
                  Nguyễn Văn A
                </p>
                <p className="text-sm text-muted-foreground">
                  Tôi đang gặp vấn đề với hàm DATE_TRUNC, nó không hoạt động
                  trong MySQL. Có ai biết cách thay thế không?
                </p>
              </div>
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
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1 text-foreground">
                  Lê Văn C
                </p>
                <p className="text-sm text-muted-foreground">
                  Tôi thấy truy vấn này có thể tối ưu hơn bằng cách thêm index
                  cho cột created_date và owner_id.
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1 text-foreground">
                  Lê Văn C
                </p>
                <p className="text-sm text-muted-foreground">
                  Tôi thấy truy vấn này có thể tối ưu hơn bằng cách thêm index
                  cho cột created_date và owner_id.
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1 text-foreground">
                  Lê Văn C
                </p>
                <p className="text-sm text-muted-foreground">
                  Tôi thấy truy vấn này có thể tối ưu hơn bằng cách thêm index
                  cho cột created_date và owner_id.
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1 text-foreground">
                  Lê Văn C
                </p>
                <p className="text-sm text-muted-foreground">
                  Tôi thấy truy vấn này có thể tối ưu hơn bằng cách thêm index
                  cho cột created_date và owner_id.
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium mb-1 text-foreground">
                  Lê Văn C
                </p>
                <p className="text-sm text-muted-foreground">
                  Tôi thấy truy vấn này có thể tối ưu hơn bằng cách thêm index
                  cho cột created_date và owner_id.
                </p>
              </div>
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
