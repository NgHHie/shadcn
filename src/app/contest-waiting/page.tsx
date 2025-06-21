// src/app/contest-waiting/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Users, FileText, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useApi } from "@/lib/api";
import { toastError, toastSuccess } from "@/lib/toast";
import { ContestWaitingData } from "@/types/contest-waiting";

export function ContestWaitingPage() {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const api = useApi();

  const [contestData, setContestData] = useState<ContestWaitingData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [canStart, setCanStart] = useState(false);
  const [starting, setStarting] = useState(false);

  // Load contest data
  useEffect(() => {
    if (!contestId) return;

    loadContestData();
  }, [contestId]);

  // Update countdown timer
  useEffect(() => {
    if (!contestData) return;

    const updateTimer = () => {
      const now = new Date();
      const startTime = new Date(contestData.startDatetime);
      const endTime = new Date(contestData.endDatetime);

      if (now >= startTime && now <= endTime) {
        // Contest is ongoing - can start
        setCanStart(true);
        const remaining = endTime.getTime() - now.getTime();
        setTimeRemaining(formatTimeRemaining(remaining));
      } else if (now < startTime) {
        // Contest hasn't started yet
        setCanStart(false);
        const remaining = startTime.getTime() - now.getTime();
        setTimeRemaining(`Bắt đầu sau: ${formatTimeRemaining(remaining)}`);
      } else {
        // Contest has ended
        setCanStart(false);
        setTimeRemaining("Cuộc thi đã kết thúc");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [contestData]);

  const loadContestData = async () => {
    if (!contestId) return;

    try {
      setLoading(true);
      //   const data = await api.contest.getContestWaiting(contestId);
      //   setContestData(data);
    } catch (error) {
      console.error("Failed to load contest data:", error);
      toastError("Không thể tải thông tin cuộc thi", {
        description: "Vui lòng thử lại sau",
      });
      // Navigate back to contest list
      navigate("/contest");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    const total = Math.max(0, milliseconds);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((total % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
    } else if (hours > 0) {
      return `${hours} giờ ${minutes} phút ${seconds} giây`;
    } else if (minutes > 0) {
      return `${minutes} phút ${seconds} giây`;
    } else {
      return `${seconds} giây`;
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} giờ`;
    }
    return `${hours} giờ ${remainingMinutes} phút`;
  };

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

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "EXAM":
        return "destructive";
      case "PRACTICE":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const handleStartContest = async () => {
    if (!contestId || !canStart || starting) return;

    try {
      setStarting(true);
      //   await api.contest.startContest(contestId);

      toastSuccess("Bắt đầu cuộc thi!", {
        description: "Chúc bạn làm bài tốt!",
      });

      // Navigate to contest page (you'll need to create this route)
      navigate(`/contest/${contestId}`);
    } catch (error) {
      console.error("Failed to start contest:", error);
      toastError("Không thể bắt đầu cuộc thi", {
        description: "Vui lòng thử lại sau",
      });
    } finally {
      setStarting(false);
    }
  };

  const handleGoBack = () => {
    navigate("/contest");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Đang tải thông tin cuộc thi...
          </p>
        </div>
      </div>
    );
  }

  if (!contestData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Không tìm thấy cuộc thi
          </h2>
          <p className="text-muted-foreground mb-4">
            Cuộc thi này có thể đã bị xóa hoặc không tồn tại.
          </p>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách cuộc thi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleGoBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">
              {contestData.name}
            </h1>
            <Badge variant={getModeColor(contestData.mode)}>
              {getModeText(contestData.mode)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contest Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Thông tin cuộc thi</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-muted-foreground">
                      Số lượng câu hỏi:
                    </span>
                    <span className="font-medium">
                      {contestData.numberQuestion}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">
                      Số người tham gia:
                    </span>
                    <span className="font-medium">
                      {contestData.numberUser}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-muted-foreground">
                      Thời gian làm bài:
                    </span>
                    <span className="font-medium">
                      {formatDuration(contestData.duration)}
                    </span>
                  </div>
                </div>

                {contestData.description && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Mô tả:</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {contestData.description}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Rules */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Nội quy làm bài:</h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      Không sử dụng tài liệu trong suốt thời gian làm bài.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Không gian lận hoặc nhờ người khác giúp đỡ.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Đảm bảo nộp bài trước khi thời gian kết thúc.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      Tuân thủ quy định của kỳ thi để tránh bị hủy kết quả.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timer */}
            <Card className="text-center">
              <CardHeader>
                <h3 className="text-lg font-semibold">Thời gian còn lại</h3>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive mb-4">
                  {timeRemaining}
                </div>
                <Button
                  onClick={handleStartContest}
                  disabled={!canStart || starting}
                  className="w-full"
                  size="lg"
                >
                  {starting ? "Đang khởi tạo..." : "Bắt đầu"}
                </Button>
                {!canStart && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {contestData.status === "OPEN"
                      ? "Cuộc thi sẽ bắt đầu khi đến giờ"
                      : "Cuộc thi chưa mở hoặc đã kết thúc"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contest Details */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Chi tiết</h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Mã cuộc thi:</span>
                  <div className="font-mono font-medium">
                    {contestData.contestCode}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Bắt đầu:</span>
                  <div className="font-medium">
                    {new Date(contestData.startDatetime).toLocaleString(
                      "vi-VN"
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Kết thúc:</span>
                  <div className="font-medium">
                    {new Date(contestData.endDatetime).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <div className="font-medium">
                    <Badge
                      variant={
                        contestData.status === "OPEN" ? "default" : "secondary"
                      }
                    >
                      {contestData.status === "OPEN" ? "Đang mở" : "Đã đóng"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
