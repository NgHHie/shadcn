import { LucideCalendar, Clock, Users, Star } from "lucide-react";
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
  difficulty: string;
}

interface ContestCardProps {
  contest: Contest;
}

export function ContestCard({ contest }: ContestCardProps) {
  const getDifficultyIcon = (difficulty: string) => {
    const count = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
    return (
      <div className="flex">
        {Array.from({ length: count }).map((_, i) => (
          <Star
            key={i}
            className="w-3 h-3 text-muted-foreground fill-muted-foreground"
          />
        ))}
      </div>
    );
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Dễ";
      case "medium":
        return "Trung bình";
      case "hard":
        return "Khó";
      default:
        return "Không xác định";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ongoing":
        return "default";
      case "upcoming":
        return "secondary";
      case "finished":
        return "outline";
      default:
        return "outline";
    }
  };

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

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-2">
            {contest.name}
          </h3>
          <Badge variant={getStatusVariant(contest.status)}>
            {getStatusText(contest.status)}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {contest.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {getDifficultyIcon(contest.difficulty)}
            <span className="text-sm text-muted-foreground">
              {getDifficultyText(contest.difficulty)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {contest.participants}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LucideCalendar className="w-4 h-4" />
            <span className="truncate">
              Bắt đầu: {contest.displayStartDate}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="truncate">Kết thúc: {contest.displayEndDate}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${contest.progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 text-xs">
            Kiểm tra
          </Button>
          {contest.status === "ongoing" && (
            <Button size="sm" className="flex-1 text-xs">
              Thực hành
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full text-sm"
          disabled={contest.status === "finished"}
        >
          {contest.status === "finished" ? "Đã tham gia" : "Tham gia"}
        </Button>
      </div>
    </Card>
  );
}
