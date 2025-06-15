import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Contest {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  displayStartDate: string;
  displayEndDate: string;
  participants: number;
  status: string;
  progress: number;
  description: string;
  tags?: string[]; // Thêm trường tags cho các loại status phụ
}

interface ContestCardProps {
  contest: Contest;
}

export function ContestCard({ contest }: ContestCardProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case "ongoing":
        return "Đang diễn ra";
      case "upcoming":
        return "Sắp tới";
      case "finished":
        return "Đã kết thúc";
      default:
        return "Không xác định";
    }
  };

  const getCardBorderColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "border-green-500";
      case "upcoming":
        return "border-blue-500";
      case "finished":
        return "border-gray-400";
      default:
        return "border-l-1 border-l-gray-400";
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-500";
      case "upcoming":
        return "bg-blue-500";
      case "finished":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <Card
      className={`p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${getCardBorderColor(
        contest.status
      )}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground text-base leading-tight">
            {contest.name}
          </h3>
          <Badge className={`shrink-0 ${getProgressBarColor(contest.status)}`}>
            {getStatusText(contest.status)}
          </Badge>
        </div>

        {/* Hiển thị các tags nếu có */}
        {contest.tags && contest.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contest.tags.map((tag, index) => {
              const isKiemTra = tag.toLowerCase() === "kiểm tra";
              return (
                <div key={index} className="relative inline-block">
                  <Badge
                    variant={isKiemTra ? "destructive" : "outline"}
                    className={`text-xs relative overflow-hidden ${
                      isKiemTra ? "z-10" : "border-gray-400"
                    }`}
                  >
                    {tag}
                  </Badge>
                  {isKiemTra && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="animate-ripple absolute block h-8 w-8 rounded-full bg-red-500 opacity-20"></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          {contest.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="w-3 h-3 text-blue-500" />
          <span>{contest.participants} người tham gia</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">
              Bắt đầu:{" "}
              <span className="text-foreground">
                {contest.displayStartDate}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">
              Kết thúc:{" "}
              <span className="text-foreground">{contest.displayEndDate}</span>
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${getProgressBarColor(
                contest.status
              )}`}
              style={{ width: `${contest.progress}%` }}
            />
          </div>
        </div>

        <Button
          variant={contest.status === "finished" ? "outline" : "default"}
          className={`w-full text-sm font-medium ${
            contest.status === "ongoing"
              ? "bg-green-500 hover:bg-green-600 text-white"
              : contest.status === "upcoming"
              ? "bg-blue-500 hover:bg-blue-600 text-white"
              : ""
          }`}
          disabled={contest.status === "finished"}
        >
          {contest.status === "finished" ? "Đã tham gia" : "Tham gia"}
        </Button>
      </div>
    </Card>
  );
}
