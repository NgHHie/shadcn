import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "text-green-600 bg-green-50 border-green-200";
      case "upcoming":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "finished":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
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
              className="h-6 w-6 p-0 hover:bg-blue-100"
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="h-6 w-6 p-0 hover:bg-blue-100"
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
                  ${isToday ? "bg-blue-500 text-white font-bold shadow-md" : ""}
                  ${
                    hasContestDay && !isToday
                      ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
                      : ""
                  }
                  ${
                    !hasContestDay && !isToday
                      ? "hover:bg-blue-50 text-foreground"
                      : ""
                  }
                `}
              >
                {day}
                {hasContestDay && (
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-sm"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
            <span className="text-muted-foreground">Hôm nay</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full relative">
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            </div>
            <span className="text-muted-foreground">Có cuộc thi</span>
          </div>
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="space-y-2">
            <div className=" rounded-lg ">
              <div className="flex items-center justify-between">
                <CalendarIcon className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-medium text-foreground">
                  {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/
                  {selectedDate.getFullYear()}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(null)}
                  className="h-5 w-5 p-0 hover:bg-red-100"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {selectedDateContests.length > 0 ? (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-foreground font-medium flex items-center gap-1">
                    {selectedDateContests.length} cuộc thi:
                  </p>
                  <div className="space-y-2">
                    {selectedDateContests.map((contest) => (
                      <div
                        key={contest.id}
                        className={`p-2 rounded-lg border ${getStatusColor(
                          contest.status
                        )}`}
                      >
                        <h4 className="text-xs font-medium leading-tight">
                          {contest.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1 text-xs">
                          <span>
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
                          <span className="font-medium">
                            {getStatusText(contest.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
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
