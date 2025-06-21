// src/components/contest/contest-joined-header.tsx
import { Trophy, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContestJoinedDetail {
  id: string;
  contestCode: string;
  name: string;
  startDatetime: string;
  endDatetime: string;
  mode: "PRACTICE" | "EXAM";
  status: "OPEN" | "CLOSED" | "SCHEDULED";
  isTracker: boolean;
}

interface ContestJoinedHeaderProps {
  contest: ContestJoinedDetail;
  timeRemaining: string;
  isActive: boolean;
  onRefresh: () => void;
}

export function ContestJoinedHeader({
  contest,
  timeRemaining,
  isActive,
  onRefresh,
}: ContestJoinedHeaderProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800 border-green-200";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Đang diễn ra";
      case "SCHEDULED":
        return "Sắp diễn ra";
      case "CLOSED":
        return "Đã kết thúc";
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Contest Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold">{contest.name}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-xs font-mono">
                {contest.contestCode}
              </Badge>

              <Badge
                variant="outline"
                className={`text-xs ${getStatusBadgeClass(contest.status)}`}
              >
                {getStatusText(contest.status)}
              </Badge>

              <Badge
                variant={contest.mode === "EXAM" ? "destructive" : "secondary"}
                className="text-xs"
              >
                {contest.mode === "EXAM" ? "Thi" : "Luyện tập"}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              <div>
                Bắt đầu:{" "}
                {new Date(contest.startDatetime).toLocaleString("vi-VN")}
              </div>
              <div>
                Kết thúc:{" "}
                {new Date(contest.endDatetime).toLocaleString("vi-VN")}
              </div>
            </div>
          </div>

          {/* Timer and Actions */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span
                className={`font-mono text-lg ${
                  isActive ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                {timeRemaining}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
