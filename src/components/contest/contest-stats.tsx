// src/components/contest/contest-stats.tsx
import { BarChart3, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ContestStatsProps {
  totalQuestions: number;
  completedQuestions: number;
  timeRemaining: string;
  isActive: boolean;
}

export function ContestStats({
  totalQuestions,
  completedQuestions,
  timeRemaining,
  isActive,
}: ContestStatsProps) {
  const completionRate =
    totalQuestions > 0
      ? Math.round((completedQuestions / totalQuestions) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tiến độ</p>
              <p className="text-xl font-semibold">
                {completedQuestions}/{totalQuestions}
              </p>
              <p className="text-xs text-muted-foreground">
                {completionRate}% hoàn thành
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Completed */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
              <p className="text-xl font-semibold text-green-600">
                {completedQuestions}
              </p>
              <p className="text-xs text-muted-foreground">câu hỏi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isActive ? "bg-orange-100" : "bg-gray-100"
              }`}
            >
              <Clock
                className={`h-5 w-5 ${
                  isActive ? "text-orange-600" : "text-gray-600"
                }`}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Thời gian</p>
              <p
                className={`text-xl font-semibold font-mono ${
                  isActive ? "text-orange-600" : "text-gray-600"
                }`}
              >
                {timeRemaining.includes(":")
                  ? timeRemaining
                  : timeRemaining.length > 20
                  ? timeRemaining.slice(0, 20) + "..."
                  : timeRemaining}
              </p>
              <p className="text-xs text-muted-foreground">
                {isActive ? "còn lại" : "trạng thái"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
