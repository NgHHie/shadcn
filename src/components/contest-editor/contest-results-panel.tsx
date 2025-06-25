// src/components/contest-editor/contest-results-panel.tsx
"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Timer } from "lucide-react";
import { SalesTable } from "@/components/editor/sales-table";

interface QueryResult {
  status: number;
  result: any[] | string;
  typeQuery: string;
  timeExec: number;
  testPass: number;
  totalTest: number;
}

interface ContestResultsPanelProps {
  queryResult: QueryResult | null;
}

export function ContestResultsPanel({ queryResult }: ContestResultsPanelProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <Card className="h-full m-3 mt-0">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium">Kết quả</h3>
          </div>

          <div className="flex-1 overflow-auto">
            {queryResult ? (
              queryResult.status === 200 ? (
                <div>
                  <div className="p-4 pb-0">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Query executed successfully
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Array.isArray(queryResult.result)
                          ? queryResult.result.length
                          : 0}{" "}
                        rows • {queryResult.timeExec}ms •{" "}
                        {queryResult.typeQuery}
                      </span>
                    </div>
                  </div>
                  {Array.isArray(queryResult.result) && (
                    <SalesTable data={queryResult.result} />
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
                      Query failed
                    </span>
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400 font-mono">
                    {typeof queryResult.result === "string"
                      ? queryResult.result
                      : "Unknown error"}
                  </div>
                </div>
              )
            ) : (
              <div className="p-8 text-center">
                <Timer className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Chạy query để xem kết quả
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
