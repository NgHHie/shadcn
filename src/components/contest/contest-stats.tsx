// src/components/contest/contest-stats.tsx
import { Clock, Trophy, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ContestStatsProps {
  timeRemaining: string;
  completed: number;
  total: number;
  points: number;
  totalPoints: number;
}

export function ContestStats({
  timeRemaining,
  completed,
  total,
  points,
  totalPoints,
}: ContestStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Thời gian còn lại</p>
              <p className="text-lg font-semibold text-red-500">
                {timeRemaining}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Tiến độ</p>
              <p className="text-lg font-semibold">
                {completed}/{total} câu
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Điểm số</p>
              <p className="text-lg font-semibold">
                {points}/{totalPoints} điểm
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
