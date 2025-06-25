// src/components/contest/global-contest-header.tsx
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Timer, ArrowLeft } from "lucide-react";
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

  const handleCompleteClick = () => {
    if (onCompleteClick) {
      onCompleteClick();
    } else {
      api.auth.logout();
    }
  };

  return (
    <div className="w-full border-b">
      <div className="w-full px-4 py-3">
        <div className="flex items-start justify-between">
          {/* Left section - Back button (if needed) and Contest info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </Button>
            )}

            <div className="flex flex-col min-w-0 flex-1">
              {contest && (
                <h1 className="text-xl font-semibold truncate">
                  {contest.name}
                </h1>
              )}

              {/* User info below contest name */}
              {userInfo && (
                <span className="text-white text-sm mt-1">
                  {userInfo.fullName} - {userInfo.userCode}
                </span>
              )}
            </div>
          </div>

          {/* Right section - Timer and complete button */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Timer */}
            {timeRemaining && (
              <span className="font-mono text-lg font-medium text-white">
                {timeRemaining}
              </span>
            )}

            {/* Complete button */}
            {showCompleteButton && (
              <Button variant="outline" size="sm" onClick={handleCompleteClick}>
                Hoàn thành
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
