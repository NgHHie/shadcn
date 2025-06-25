// src/components/contest/global-contest-header.tsx
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Timer, User } from "lucide-react";
import { useApi } from "@/lib/api";

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  userCode: string;
  fullName: string;
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
  showBackButton?: boolean;
  showCompleteButton?: boolean;
  onBackClick?: () => void;
  onCompleteClick?: () => void;
}

export function GlobalContestHeader({
  contest,
  timeRemaining,
  isActive = false,
  showBackButton = false,
  showCompleteButton = true,
  onBackClick,
  onCompleteClick,
}: GlobalContestHeaderProps) {
  const navigate = useNavigate();
  const api = useApi();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userData = await api.auth.getUserInfo();
        setUserInfo(userData);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const handleCompleteClick = async () => {
    await api.auth.logout();
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1000);
  };

  return (
    <div className="w-full bg-gradient-to-r  border-b  shadow-md">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Left section - Back button and Contest info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="flex items-center gap-2 flex-shrink-0 text-white hover:bg-white/10 border-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Quay lại</span>
              </Button>
            )}

            {/* Contest and User info */}
            <div className="flex flex-col min-w-0 flex-1">
              {contest && (
                <h1 className="text-xl font-semibold text-white truncate leading-tight">
                  {contest.name}
                </h1>
              )}

              {userInfo && (
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-3 w-3 text-blue-200" />
                  <span className="text-blue-100 text-sm truncate">
                    {userInfo.fullName} - {userInfo.userCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right section - Timer and Complete button */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Timer */}
            {timeRemaining && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                <Timer className="h-4 w-4 text-white" />
                <span className="font-mono text-lg font-medium text-white whitespace-nowrap">
                  {timeRemaining}
                </span>
              </div>
            )}

            {/* Complete button */}
            {showCompleteButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompleteClick}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm"
              >
                Hoàn thành
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
