import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users,
  X,
} from "lucide-react";
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

interface ContestCalendarProps {
  contests: Contest[];
}

export function ContestCalendar({ contests }: ContestCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Helper function để lấy contest theo ngày
  const getContestsForDate = (date: Date) => {
    return contests.filter((contest) => {
      const contestStart = new Date(contest.startDate);
      const contestEnd = new Date(contest.endDate);

      return (
        (date >= new Date(contestStart.toDateString()) &&
          date <= new Date(contestEnd.toDateString())) ||
        date.toDateString() === contestStart.toDateString()
      );
    });
  };

  // Helper function để lấy tất cả ngày có contest
  const getContestDates = () => {
    const dates: Date[] = [];
    contests.forEach((contest) => {
      const startDate = new Date(contest.startDate);
      const endDate = new Date(contest.endDate);

      dates.push(new Date(startDate.toDateString()));

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate.toDateString()));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return dates.filter(
      (date, index, self) =>
        index ===
        self.findIndex((d) => d.toDateString() === date.toDateString())
    );
  };

  const contestDates = getContestDates();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasContest = (day: number) => {
    return contestDates.some(
      (contestDate) =>
        contestDate.getDate() === day &&
        contestDate.getMonth() === currentDate.getMonth() &&
        contestDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const selectedDateContests = selectedDate
    ? getContestsForDate(selectedDate)
    : [];

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "secondary";
      case "medium":
        return "outline";
      case "hard":
        return "destructive";
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
    <Card className="p-3">
      <div className="space-y-3">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground text-sm">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("prev")}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((day) => (
            <div key={`empty-${day}`} className="h-6"></div>
          ))}
          {days.map((day) => {
            const hasContestDay = hasContest(day);
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === currentDate.getMonth() &&
              new Date().getFullYear() === currentDate.getFullYear();

            return (
              <button
                key={day}
                onClick={() =>
                  setSelectedDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      day
                    )
                  )
                }
                className={`
                  h-6 w-6 text-xs rounded-md transition-all duration-200 relative flex items-center justify-center font-medium
                  ${
                    isToday
                      ? "bg-primary text-primary-foreground font-bold"
                      : ""
                  }
                  ${
                    hasContestDay && !isToday
                      ? "bg-accent text-accent-foreground border border-border"
                      : ""
                  }
                  ${
                    !hasContestDay && !isToday
                      ? "hover:bg-accent text-foreground"
                      : ""
                  }
                `}
              >
                {day}
                {hasContestDay && (
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-muted-foreground">Hôm nay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent border border-border rounded-full relative">
              <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-primary rounded-full"></div>
            </div>
            <span className="text-muted-foreground">Có cuộc thi</span>
          </div>
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="space-y-2">
            <div className="p-2 bg-accent rounded-md border">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">
                  Ngày: {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/
                  {selectedDate.getFullYear()}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(null)}
                  className="h-4 w-4 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {selectedDateContests.length > 0 ? (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-foreground font-medium flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {selectedDateContests.length} cuộc thi:
                  </p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {selectedDateContests.map((contest) => (
                      <div
                        key={contest.id}
                        className="p-2 bg-card rounded border"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-medium text-foreground line-clamp-1">
                            {contest.name}
                          </h4>
                          <Badge
                            variant={getDifficultyVariant(contest.difficulty)}
                            className="text-xs px-1 py-0"
                          >
                            {contest.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {contest.description}
                        </p>
                        <div className="flex items-center justify-between mt-1.5 text-xs">
                          <span className="text-muted-foreground">
                            {new Date(contest.startDate).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}{" "}
                            -{" "}
                            {new Date(contest.endDate).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          <span className="text-foreground font-medium">
                            {getStatusText(contest.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {contest.participants} người tham gia
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Không có cuộc thi
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
