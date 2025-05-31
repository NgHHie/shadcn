"use client";

import { useState } from "react";
import {
  LucideCalendar,
  Clock,
  Users,
  Trophy,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function Contest() {
  const [currentPage, setCurrentPage] = useState(1);

  const contests = [
    {
      id: 1,
      name: "NHóm11_new",
      startDate: "07:45 07/12/2024",
      endDate: "08:15 07/12/2024",
      participants: 86,
      status: "finished",
      progress: 100,
    },
    {
      id: 2,
      name: "NHóm12_new",
      startDate: "10:25 30/11/2024",
      endDate: "11:05 30/11/2024",
      participants: 89,
      status: "finished",
      progress: 100,
    },
    {
      id: 3,
      name: "NHóm15_1_45_(13h40den14h10)_25/11",
      startDate: "14:30 25/11/2024",
      endDate: "14:40 25/11/2024",
      participants: 44,
      status: "finished",
      progress: 100,
    },
    {
      id: 4,
      name: "Contest vui về test",
      startDate: "12:00 20/11/2024",
      endDate: "12:00 26/11/2024",
      participants: 106,
      status: "ongoing",
      progress: 75,
    },
    {
      id: 5,
      name: "NhómN08_CLC_Cóha",
      startDate: "11:20 11/11/2024",
      endDate: "11:50 11/11/2024",
      participants: 43,
      status: "finished",
      progress: 100,
    },
    {
      id: 6,
      name: "NhómN07_CLC_Cóha",
      startDate: "08:15 11/11/2024",
      endDate: "08:45 11/11/2024",
      participants: 41,
      status: "finished",
      progress: 100,
    },
  ];

  const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Contest dates for highlighting
    const contestDates = [
      new Date(2024, 10, 11), // 11/11/2024
      new Date(2024, 10, 20), // 20/11/2024
      new Date(2024, 10, 25), // 25/11/2024
      new Date(2024, 10, 30), // 30/11/2024
      new Date(2024, 11, 7), // 07/12/2024
    ];

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

    return (
      <Card className="p-4 bg-white border border-gray-200">
        <div className="space-y-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="p-1 h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="p-1 h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((day) => (
              <div key={`empty-${day}`} className="h-8"></div>
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
                    h-8 w-8 text-sm rounded-full transition-all duration-200 relative
                    ${isToday ? "bg-blue-500 text-white font-bold" : ""}
                    ${
                      hasContestDay && !isToday
                        ? "bg-green-100 text-green-700 font-semibold hover:bg-green-200"
                        : ""
                    }
                    ${
                      !hasContestDay && !isToday
                        ? "hover:bg-gray-100 text-gray-700"
                        : ""
                    }
                  `}
                >
                  {day}
                  {hasContestDay && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Hôm nay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full relative">
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              </div>
              <span className="text-gray-600">Có cuộc thi</span>
            </div>
          </div>

          {selectedDate && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Ngày đã chọn: {selectedDate.getDate()}/
                {selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
              </p>
              {hasContest(selectedDate.getDate()) ? (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Có cuộc thi trong ngày này
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Không có cuộc thi</p>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const ContestCard = ({ contest }: { contest: any }) => {
    return (
      <Card className="p-6 bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {contest.name}
          </h3>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LucideCalendar className="w-4 h-4 text-blue-500" />
              <span>Bắt đầu: {contest.startDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-pink-500" />
              <span>Kết thúc: {contest.endDate}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 px-3 py-1 text-xs"
            >
              {contest.status === "finished" ? "Đã kết thúc" : "Đang diễn ra"}
            </Button>
            <Button
              size="sm"
              className="relative overflow-hidden bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs animate-pulse hover:animate-none"
            >
              <span className="relative z-10">Kiểm tra</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            </Button>
            {contest.status === "ongoing" && (
              <Button
                size="sm"
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50 px-3 py-1 text-xs"
              >
                Thực hành
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500 relative"
                style={{ width: `${contest.progress}%` }}
              >
                <div className="absolute right-0 top-0 w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Số người tham gia: </span>
              <span className="font-semibold text-blue-600">
                {contest.participants}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
            disabled={contest.status === "finished"}
          >
            {contest.status === "finished" ? "Đã tham gia" : "Tham gia"}
          </Button>
        </div>
      </Card>
    );
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Trophy className="w-12 h-12 text-gray-400" />
      </div>
      <p className="text-gray-500">Bạn đang không tham gia cuộc thi nào</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Calendar />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Currently Participating Contests */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Cuộc thi đang tham gia
              </h2>
              <Card className="p-8 bg-white border border-gray-200">
                <EmptyState />
              </Card>
            </div>

            {/* Available Contests */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Cuộc thi hiện tại
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contests.map((contest) => (
                  <ContestCard key={contest.id} contest={contest} />
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </Button>

              {[1, 2, 3].map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page ? "bg-blue-500 text-white" : ""
                  }
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === 3}
              >
                ›
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
