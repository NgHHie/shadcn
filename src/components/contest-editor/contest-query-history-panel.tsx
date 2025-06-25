// src/components/contest-editor/contest-query-history-panel.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
  Copy,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toastSuccess } from "@/lib/toast";

interface QueryHistoryItem {
  id: string;
  createdAt: string;
  timeSubmit: string;
  timeout: number;
  status: "AC" | "WA" | "TLE" | "CE" | "PENDING";
  testPass: number;
  totalTest: number;
  question: {
    questionCode: string;
    title: string;
  };
  database: {
    id: string;
    name: string;
  };
  sql?: string; // Might not be available in contest mode
}

interface ContestQueryHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  queryHistory: QueryHistoryItem[];
  onSelectQuery: (sql: string) => void;
}

export function ContestQueryHistoryPanel({
  isOpen,
  onClose,
  queryHistory,
  onSelectQuery,
}: ContestQueryHistoryPanelProps) {
  const [selectedItem, setSelectedItem] = useState<QueryHistoryItem | null>(
    null
  );

  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AC":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "WA":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "TLE":
        return <Timer className="h-4 w-4 text-yellow-500" />;
      case "CE":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AC":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
      case "WA":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      case "TLE":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
      case "CE":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
      case "PENDING":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "AC":
        return "Accepted";
      case "WA":
        return "Wrong Answer";
      case "TLE":
        return "Time Limit";
      case "CE":
        return "Compile Error";
      case "PENDING":
        return "Đang chấm";
      default:
        return status;
    }
  };

  const handleCopyToClipboard = (sql: string) => {
    navigator.clipboard.writeText(sql);
    toastSuccess("Đã copy SQL vào clipboard");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[90vw] h-[80vh] max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contest History</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-0 h-[calc(80vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* History List */}
            <div className="border-r">
              <div className="p-4 border-b">
                <h3 className="font-medium">
                  Lịch sử submit ({queryHistory.length})
                </h3>
              </div>

              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="p-2 space-y-2">
                  {queryHistory.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-3" />
                      <p>Chưa có lịch sử submit</p>
                    </div>
                  ) : (
                    queryHistory.map((item) => (
                      <Card
                        key={item.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedItem?.id === item.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(item.status)}
                              <Badge className={getStatusColor(item.status)}>
                                {getStatusText(item.status)}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(item.timeSubmit),
                                "HH:mm:ss dd/MM",
                                { locale: vi }
                              )}
                            </span>
                          </div>

                          <div className="text-sm space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Test:
                              </span>
                              <span
                                className={
                                  item.status === "AC"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {item.testPass}/{item.totalTest}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Time:
                              </span>
                              <span>{item.timeout}ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">DB:</span>
                              <span>{item.database.name}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Detail Panel */}
            <div className="flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-medium">Chi tiết submission</h3>
              </div>

              <div className="flex-1 overflow-hidden">
                {selectedItem ? (
                  <div className="h-full flex flex-col">
                    <div className="p-4 space-y-4 border-b">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedItem.status)}
                        <Badge className={getStatusColor(selectedItem.status)}>
                          {getStatusText(selectedItem.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Test passed:
                          </span>
                          <div
                            className={
                              selectedItem.status === "AC"
                                ? "text-green-600 font-medium"
                                : "text-red-600 font-medium"
                            }
                          >
                            {selectedItem.testPass}/{selectedItem.totalTest}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Execution time:
                          </span>
                          <div className="font-medium">
                            {selectedItem.timeout}ms
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Database:
                          </span>
                          <div className="font-medium">
                            {selectedItem.database.name}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Submit time:
                          </span>
                          <div className="font-medium">
                            {format(
                              new Date(selectedItem.timeSubmit),
                              "HH:mm:ss dd/MM/yyyy",
                              { locale: vi }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SQL Code - hiển thị nếu có */}
                    {selectedItem.sql && (
                      <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b flex items-center justify-between">
                          <h4 className="font-medium">SQL Code</h4>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCopyToClipboard(selectedItem.sql!)
                              }
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSelectQuery(selectedItem.sql!)}
                            >
                              Load vào Editor
                            </Button>
                          </div>
                        </div>
                        <ScrollArea className="flex-1">
                          <div className="p-4">
                            <pre className="text-sm font-mono whitespace-pre-wrap bg-muted p-3 rounded">
                              {selectedItem.sql}
                            </pre>
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Thông báo nếu không có SQL code */}
                    {!selectedItem.sql && (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mx-auto mb-3" />
                          <p>SQL code không khả dụng trong contest mode</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-3" />
                      <p>Chọn một submission để xem chi tiết</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
