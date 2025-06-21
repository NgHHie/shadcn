// src/components/contest/contest.tsx
"use client";

import { useState, useEffect } from "react";
import { Trophy, CalendarDays, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContestCard } from "./contest-card";
import { ContestCalendar } from "./contest-calendar";
import { useApi } from "@/lib/api";
import { useUserContext } from "@/contexts/UserContext";
import { toastError, toastSuccess } from "@/lib/toast";
import { Contest, ContestJoinStatus } from "@/types/contest";

export function ContestPage() {
  const [joinedContests, setJoinedContests] = useState<Contest[]>([]);
  const [availableContests, setAvailableContests] = useState<Contest[]>([]);
  const [joinStatus, setJoinStatus] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const api = useApi();
  const { userId } = useUserContext();

  // Load initial data
  useEffect(() => {
    loadContestData();
  }, [currentPage, userId]);

  const loadContestData = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Load joined contests and available contests in parallel
      const [joinedResponse, availableResponse] = await Promise.all([
        api.contest.getJoinedContests(),
        api.contest.getContests({ page: currentPage, size: 6 }),
      ]);

      setJoinedContests(joinedResponse);
      setAvailableContests(availableResponse.content);
      setTotalPages(availableResponse.totalPages);

      // Check join status for available contests
      if (availableResponse.content.length > 0) {
        const contestIds = availableResponse.content.map(
          (contest) => contest.id
        );
        const joinStatusResponse = await api.contest.checkJoinStatus({
          contestIds,
          userId,
        });

        // Convert to record for easy lookup
        const statusRecord: Record<string, boolean> = {};
        joinStatusResponse.forEach((status: ContestJoinStatus) => {
          statusRecord[status.contestId] = status.joined === 1;
        });
        setJoinStatus(statusRecord);
      }
    } catch (error) {
      console.error("Failed to load contest data:", error);
      toastError("Không thể tải danh sách cuộc thi", {
        description: "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContestData();
    setRefreshing(false);
    toastSuccess("Đã cập nhật danh sách cuộc thi");
  };

  const handleJoinContest = async (contestId: string) => {
    if (!userId) return;

    try {
      const payload = {
        contest: { id: contestId },
        user: { id: userId },
      };

      await api.contest.joinContest(payload);

      // Update join status locally
      setJoinStatus((prev) => ({
        ...prev,
        [contestId]: true,
      }));

      // Reload data to get updated information
      await loadContestData();

      toastSuccess("Đã tham gia cuộc thi thành công!");
    } catch (error) {
      console.error("Failed to join contest:", error);
      toastError("Không thể tham gia cuộc thi", {
        description: "Vui lòng thử lại sau",
      });
    }
  };

  const handleLeaveContest = async (contestId: string) => {
    if (!userId) return;

    try {
      // Remove from joined contests locally
      setJoinedContests((prev) =>
        prev.filter((contest) => contest.id !== contestId)
      );

      // Update join status locally
      setJoinStatus((prev) => ({
        ...prev,
        [contestId]: false,
      }));

      toastSuccess("Đã rời khỏi cuộc thi");
    } catch (error) {
      console.error("Failed to leave contest:", error);
      toastError("Không thể rời khỏi cuộc thi", {
        description: "Vui lòng thử lại sau",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
        <Trophy className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                Đang tải danh sách cuộc thi...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <ContestCalendar
              contests={[...joinedContests, ...availableContests]}
            />
          </div>

          {/* Main Content */}
          <div className="xl:col-span-4 space-y-6 order-2 xl:order-1">
            {/* Header with refresh button */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Cuộc thi</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
            </div>

            {/* Currently Participating Contests */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Cuộc thi đang tham gia ({joinedContests.length})
              </h2>
              <Card className="p-6">
                {joinedContests.length === 0 ? (
                  <EmptyState message="Bạn chưa tham gia cuộc thi nào" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {joinedContests.map((contest) => (
                      <ContestCard
                        key={contest.id}
                        contest={contest}
                        isJoined={true}
                        onJoin={() => handleJoinContest(contest.id)}
                        onLeave={() => handleLeaveContest(contest.id)}
                        showLeaveButton={true}
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Available Contests */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Cuộc thi hiện tại
              </h2>
              {availableContests.length === 0 ? (
                <Card className="p-6">
                  <EmptyState message="Không có cuộc thi nào đang diễn ra" />
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {availableContests.map((contest) => (
                    <ContestCard
                      key={contest.id}
                      contest={contest}
                      isJoined={joinStatus[contest.id] || false}
                      onJoin={() => handleJoinContest(contest.id)}
                      onLeave={() => handleLeaveContest(contest.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  ‹
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
                  if (pageNum >= totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(Math.min(totalPages - 1, currentPage + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                >
                  ›
                </Button>
              </div>
            )}
          </div>

          {/* Calendar Sidebar - hidden on mobile, shown on desktop */}
          <div className="hidden xl:block xl:col-span-1 order-1 xl:order-2">
            <div className="sticky top-6">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">Lịch cuộc thi</h3>
              </div>
              <ContestCalendar
                contests={[...joinedContests, ...availableContests]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
