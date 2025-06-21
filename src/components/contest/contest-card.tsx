// src/components/contest/contest-card.tsx
import { Users, Calendar, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Contest } from "@/types/contest";

interface ContestCardProps {
  contest: Contest;
  isJoined: boolean;
  onJoin: () => void;
  onLeave: () => void;
  showLeaveButton?: boolean; // For joined contests list
}

export function ContestCard({
  contest,
  isJoined,
  onJoin,
  onLeave,
  showLeaveButton = false,
}: ContestCardProps) {
  const navigate = useNavigate();

  // Convert datetime strings to Date objects for time comparison
  const startDate = new Date(contest.startDatetime);
  const endDate = new Date(contest.endDatetime);
  const now = new Date();

  // Determine actual status based on time and API status
  const getActualStatus = () => {
    if (contest.status === "CLOSED" || now > endDate) {
      return "CLOSED";
    }
    if (contest.status === "SCHEDULED" || now < startDate) {
      return "SCHEDULED";
    }
    return "OPEN";
  };

  const status = getActualStatus();

  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Đang diễn ra";
      case "SCHEDULED":
        return "Sắp tới";
      case "CLOSED":
      default:
        return "Đã kết thúc";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-500 text-white border-green-500";
      case "SCHEDULED":
        return "bg-blue-500 text-white border-blue-500";
      case "CLOSED":
      default:
        return "bg-gray-400 text-white border-gray-400";
    }
  };

  const getCardBorderColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "border-l-4 border-l-green-500";
      case "SCHEDULED":
        return "border-l-4 border-l-blue-500";
      case "CLOSED":
      default:
        return "border-l-4 border-l-gray-400";
    }
  };

  // Calculate progress
  const getProgress = () => {
    if (status === "CLOSED") return 100;
    if (status === "SCHEDULED") return 0;

    // For OPEN contests, calculate based on time
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  const progress = getProgress();

  // Format dates for display
  const formatDateTime = (date: Date) => {
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get mode text
  const getModeText = (mode: string) => {
    switch (mode) {
      case "EXAM":
        return "Kiểm tra";
      case "PRACTICE":
        return "Thực hành";
      default:
        return mode;
    }
  };

  // Button logic
  const getButtonText = () => {
    if (isJoined) {
      switch (status) {
        case "SCHEDULED":
          return "Vào trang chờ";
        case "OPEN":
          return "Vào làm bài";
        case "CLOSED":
        default:
          return "Đã tham gia";
      }
    }
    return "Tham gia";
  };

  const isButtonDisabled = () => {
    return status === "CLOSED";
  };

  const getButtonClass = () => {
    if (status === "CLOSED") {
      return ""; // Muted style for disabled buttons or closed contests
    }

    if (isJoined && (status === "OPEN" || status === "SCHEDULED")) {
      // Colored buttons for joined contests that can be accessed
      switch (status) {
        case "OPEN":
          return "bg-green-500 hover:bg-green-600 text-white";
        case "SCHEDULED":
          return "bg-blue-500 hover:bg-blue-600 text-white";
        default:
          return "";
      }
    }

    if (!isJoined && (status === "OPEN" || status === "SCHEDULED")) {
      // Colored buttons for contests that can be joined
      switch (status) {
        case "OPEN":
          return "bg-green-500 hover:bg-green-600 text-white";
        case "SCHEDULED":
          return "bg-blue-500 hover:bg-blue-600 text-white";
        default:
          return "";
      }
    }

    return ""; // Default muted style
  };

  const handleButtonClick = () => {
    if (isButtonDisabled()) return;

    if (showLeaveButton && !isJoined) {
      // In joined list but somehow not joined - shouldn't happen
      onLeave();
      return;
    }

    if (isJoined && (status === "OPEN" || status === "SCHEDULED")) {
      // Navigate to waiting room for joined contests
      navigate(`/contest-waiting/${contest.id}`);
    } else if (!isJoined && (status === "OPEN" || status === "SCHEDULED")) {
      // Join contest
      onJoin();
    }
  };

  return (
    <Card
      className={`p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${getCardBorderColor(
        status
      )}`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-2">
            {contest.name}
          </h3>
        </div>

        {/* Contest info badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={`text-xs ${getStatusBadgeClass(status)}`}>
            {getStatusText(status)}
          </Badge>
          <div className="relative inline-block">
            <Badge
              variant={contest.mode === "EXAM" ? "destructive" : "outline"}
              className={`text-xs relative overflow-hidden ${
                contest.mode === "EXAM" ? "z-10" : "border-gray-400"
              }`}
            >
              {getModeText(contest.mode)}
            </Badge>
            {contest.mode === "EXAM" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="animate-ripple absolute block h-8 w-8 rounded-full bg-red-500 opacity-20"></span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {contest.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {contest.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-blue-500" />
            <span>{contest.numberUser} người tham gia</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3 h-3 text-orange-500" />
            <span>{contest.numberQuestion} câu hỏi</span>
          </div>
        </div>

        {/* Time info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3 h-3 text-green-500" />
            <span className="text-muted-foreground">
              Bắt đầu:{" "}
              <span className="text-foreground font-medium">
                {formatDateTime(startDate)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3 h-3 text-red-500" />
            <span className="text-muted-foreground">
              Kết thúc:{" "}
              <span className="text-foreground font-medium">
                {formatDateTime(endDate)}
              </span>
            </span>
          </div>
        </div>

        {/* Progress bar for ongoing and finished contests */}
        {(status === "OPEN" || status === "CLOSED") && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tiến độ</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  status === "CLOSED" ? "bg-gray-400" : "bg-green-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action button */}
        <Button
          onClick={handleButtonClick}
          variant={isButtonDisabled() ? "outline" : "default"}
          className={`w-full text-sm font-medium ${getButtonClass()}`}
          disabled={isButtonDisabled()}
        >
          {getButtonText()}
        </Button>
      </div>
    </Card>
  );
}
