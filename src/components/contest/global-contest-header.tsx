// src/components/contest/global-contest-header.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Timer,
  Trophy,
  User,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { toastInfo, toastSuccess, toastError } from "@/lib/toast";
import { useApi } from "@/lib/api";

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  email: string;
  userCode: string;
  fullName: string;
  isPremium: boolean;
}

interface ContestData {
  id: string;
  contestCode: string;
  name: string;
  startDatetime: string;
  endDatetime: string;
  mode: "PRACTICE" | "EXAM";
  status: "OPEN" | "CLOSED" | "SCHEDULED";
}

interface GlobalContestHeaderProps {
  contest?: ContestData;
  timeRemaining?: string;
  isActive?: boolean;
  onRefresh?: () => void;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
}

export function GlobalContestHeader({
  contest,
  timeRemaining,
  isActive = false,
  onRefresh,
  showBackButton = false,
  backButtonText = "Quay lại",
  onBackClick,
}: GlobalContestHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const api = useApi();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user info from API
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const userData = await api.auth.getUserInfo();
        setUserInfo(userData);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        toastError("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []); // 👈 Không phụ thuộc vào api

  const handleLogout = useCallback(async () => {
    try {
      const loadingToast = toastInfo("Đang đăng xuất...", {
        duration: Infinity,
      });

      await api.auth.logout();

      if (loadingToast) {
        import("@/lib/toast").then(({ dismissToast }) => {
          dismissToast(loadingToast);
        });
      }

      toastSuccess("Đăng xuất thành công!", {
        description: "Hẹn gặp lại bạn!",
        duration: 3000,
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      api.utils.clearAuthData();
      toastSuccess("Đăng xuất thành công!");
      navigate("/login", { replace: true });
    }
  }, [api, navigate]);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800 border-green-200";
      case "CLOSED":
        return "bg-red-100 text-red-800 border-red-200";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "OPEN":
        return "Đang diễn ra";
      case "CLOSED":
        return "Đã kết thúc";
      case "SCHEDULED":
        return "Sắp diễn ra";
      default:
        return "Không xác định";
    }
  };

  const getModeBadgeClass = (mode?: string) => {
    switch (mode) {
      case "EXAM":
        return "bg-red-100 text-red-800 border-red-200";
      case "PRACTICE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getModeText = (mode?: string) => {
    switch (mode) {
      case "EXAM":
        return "Thi thử";
      case "PRACTICE":
        return "Luyện tập";
      default:
        return "Không xác định";
    }
  };

  const getUserInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="w-full bg-background border-b shadow-sm">
      <div className="w-full px-4 lg:px-6">
        <Card className="border-0 shadow-none bg-transparent">
          <div className="flex items-center justify-between p-4">
            {/* Left section - Back button and Contest Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackClick}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">{backButtonText}</span>
                </Button>
              )}

              {contest && (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Trophy className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <h1 className="font-semibold text-foreground text-lg leading-tight truncate">
                        {contest.name}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        Mã: {contest.contestCode}
                      </p>
                    </div>

                    {/* Status and Mode badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusBadgeClass(
                          contest.status
                        )}`}
                      >
                        {getStatusText(contest.status)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getModeBadgeClass(contest.mode)}`}
                      >
                        {getModeText(contest.mode)}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Center section - Timer */}
            {timeRemaining && (
              <div className="flex items-center gap-2 px-4">
                <Timer
                  className={`h-4 w-4 ${
                    isActive ? "text-green-600" : "text-orange-600"
                  }`}
                />
                <span
                  className={`font-mono text-sm font-medium ${
                    isActive ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {timeRemaining}
                </span>
              </div>
            )}

            {/* Right section - User Info and Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Làm mới</span>
                </Button>
              )}

              {/* User Info */}
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                  <div className="hidden sm:block">
                    <div className="w-20 h-4 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ) : userInfo ? (
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={userInfo.avatar}
                      alt={userInfo.fullName}
                    />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(userInfo.fullName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden sm:flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {userInfo.fullName}
                      </span>
                      {userInfo.isPremium && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0.5"
                        >
                          Premium
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {userInfo.userCode}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="h-8 w-8 p-1.5 rounded-full bg-muted text-muted-foreground" />
                  <span className="hidden sm:inline text-sm text-muted-foreground">
                    Không thể tải thông tin
                  </span>
                </div>
              )}

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
