"use client";

import { useState } from "react";
import { Trophy, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContestCard } from "./contest-card";
import { ContestCalendar } from "./contest-calendar";

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

interface ContestProps {
  contests: Contest[];
}

export function Contest({ contests }: ContestProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const EmptyState = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
        <Trophy className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">
        Bạn đang không tham gia cuộc thi nào
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Calendar for mobile - shown first */}
          <div className="xl:hidden">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-foreground">Lịch cuộc thi</h3>
            </div>
            <ContestCalendar contests={contests} />
          </div>

          {/* Main Content - always comes first in DOM but order changes */}
          <div className="xl:col-span-4 space-y-6 order-2 xl:order-1">
            {/* Currently Participating Contests */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Cuộc thi đang tham gia
              </h2>
              <Card className="p-6">
                <EmptyState />
              </Card>
            </div>

            {/* Available Contests */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Cuộc thi hiện tại
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

          {/* Calendar Sidebar - hidden on mobile, shown on desktop */}
          <div className="hidden xl:block xl:col-span-1 order-1 xl:order-2">
            <div className="sticky top-6">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">Lịch cuộc thi</h3>
              </div>
              <ContestCalendar contests={contests} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
