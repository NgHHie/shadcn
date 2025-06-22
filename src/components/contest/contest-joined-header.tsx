// src/components/contest/contest-joined-header.tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCallback } from "react";
import { toastInfo, toastSuccess } from "@/lib/toast";
import api from "@/lib/api";

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
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      // Show loading toast
      const loadingToast = toastInfo("Đang đăng xuất...", {
        duration: Infinity, // Keep until we dismiss it
      });

      // Call logout API which will clear tokens
      await api.auth.logout();

      // Dismiss loading toast
      if (loadingToast) {
        import("@/lib/toast").then(({ dismissToast }) => {
          dismissToast(loadingToast);
        });
      }

      // Show success toast
      toastSuccess("Đăng xuất thành công!", {
        description: "Hẹn gặp lại bạn!",
        duration: 3000,
      });

      // Redirect after showing toast
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);

      // Even if API call fails, still clear local tokens and redirect
      api.utils.clearAuthData();

      toastSuccess("Đăng xuất thành công!", {
        description: "Đã xóa phiên đăng nhập cục bộ",
        duration: 3000,
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    }
  }, [api, navigate]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:items-center">
          {/* Contest Title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {contest.name}
            </h1>
          </div>

          {/* Time and Refresh */}
          <div className="flex items-center gap-4">
            {/* Time Remaining */}
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Thời gian còn lại</p>
              <p className={`text-lg font-mono font-semibold `}>
                {timeRemaining}
              </p>
            </div>

            {/* Refresh Button */}
            <Button
              variant="default"
              size="sm"
              onClick={handleLogout}
              className="shrink-0"
            >
              Hoàn thành
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
