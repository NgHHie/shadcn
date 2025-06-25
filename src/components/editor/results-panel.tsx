// src/components/editor/results-panel.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { SalesTable } from "@/components/editor/sales-table";

interface QueryResult {
  status: number;
  result: any[] | string;
  typeQuery: string;
  timeExec: number;
  testPass?: number;
  totalTest?: number;
}

interface ResultsPanelProps {
  queryResult: QueryResult | null;
  queryError: string | null;
  isRunning: boolean;
}

export function ResultsPanel({
  queryResult,
  queryError,
  isRunning,
}: ResultsPanelProps) {
  const getStatusIcon = (status: number) => {
    if (status === 1 || status === 200) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: number) => {
    if (status === 1 || status === 200) {
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
          Success
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
        Error
      </Badge>
    );
  };

  return (
    <div className="flex-1 overflow-hidden">
      <Card className="h-full m-2 mt-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-medium">Kết quả</h3>
            {isRunning && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang thực thi...
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {isRunning ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground animate-spin" />
                <p className="text-muted-foreground">
                  Đang thực thi SQL query...
                </p>
              </div>
            ) : queryResult ? (
              <div>
                {/* Result Header */}
                <div className="p-3 pb-0">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(queryResult.status)}
                      {getStatusBadge(queryResult.status)}
                      <span className="text-sm font-medium">
                        {queryResult.status === 1 || queryResult.status === 200
                          ? "Query executed successfully"
                          : "Query execution failed"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {Array.isArray(queryResult.result)
                          ? queryResult.result.length
                          : 0}{" "}
                        rows
                      </span>
                      <span>•</span>
                      <span>{queryResult.timeExec}ms</span>
                      <span>•</span>
                      <span>{queryResult.typeQuery}</span>
                      {queryResult.testPass !== undefined &&
                        queryResult.totalTest !== undefined && (
                          <>
                            <span>•</span>
                            <span>
                              {queryResult.testPass}/{queryResult.totalTest}{" "}
                              tests passed
                            </span>
                          </>
                        )}
                    </div>
                  </div>
                </div>

                {/* Result Data */}
                {queryResult.status === 1 || queryResult.status === 200 ? (
                  Array.isArray(queryResult.result) &&
                  queryResult.result.length > 0 ? (
                    <SalesTable data={queryResult.result} />
                  ) : (
                    <div className="p-8 text-center">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-green-500" />
                      <p className="text-muted-foreground">
                        Query thành công nhưng không có dữ liệu trả về
                      </p>
                    </div>
                  )
                ) : (
                  <div className="p-3">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                      <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono">
                        {typeof queryResult.result === "string"
                          ? queryResult.result
                          : "Unknown error occurred"}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : queryError ? (
              <div className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    Query Error
                  </span>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap font-mono">
                    {queryError}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Chạy SQL query để xem kết quả
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Nhấn Run hoặc sử dụng Ctrl + Enter
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
