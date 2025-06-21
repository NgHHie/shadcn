// src/app/contest-waiting/page.tsx (hoặc src/pages/contest-waiting/[contestId].tsx)
"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Users,
  FileText,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
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
      // Gọi API waiting với endpoint đúng
      const data = await api.contest.getContestWaiting(contestId);
      setContestData(data);
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
      return `${days} ngày ${hours} giờ ${minutes} phút`;
    } else if (hours > 0) {
      return `${hours} giờ ${minutes} phút ${seconds} giây`;
    } else if (minutes > 0) {
      return `${minutes} phút ${seconds} giây`;
    } else {
      return `${seconds} giây`;
    }
  };

  const handleGoBack = () => {
    navigate("/contest");
  };

  const handleStartContest = async () => {
    if (!contestData || !canStart) return;

    try {
      setStarting(true);
      // Navigate to contest start page
      navigate(`/contest/${contestData.id}/start`);
      toastSuccess("Đang chuyển đến cuộc thi...");
    } catch (error) {
      console.error("Failed to start contest:", error);
      toastError("Không thể bắt đầu cuộc thi", {
        description: "Vui lòng thử lại sau",
      });
    } finally {
      setStarting(false);
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "EXAM":
        return "destructive";
      case "PRACTICE":
        return "default";
      default:
        return "secondary";
    }
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800 border-green-200";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Đang diễn ra";
      case "SCHEDULED":
        return "Đã lên lịch";
      case "CLOSED":
        return "Đã đóng";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
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
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Không tìm thấy cuộc thi</h2>
          <p className="text-muted-foreground">
            Cuộc thi không tồn tại hoặc bạn không có quyền truy cập.
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
      <div className="container mx-auto px-4 py-6 max-w-6xl">
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
                    <span className="text-muted-foreground">Thời gian:</span>
                    <span className="font-medium">
                      {contestData.duration} phút
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Chế độ:</span>
                    <Badge
                      variant={getModeColor(contestData.mode)}
                      className="text-xs"
                    >
                      {getModeText(contestData.mode)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Hướng dẫn</h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <p>
                    • Đảm bảo kết nối internet ổn định trong suốt quá trình thi
                  </p>
                  <p>
                    • Không được sử dụng tài liệu tham khảo (đối với chế độ thi)
                  </p>
                  <p>• Mỗi câu hỏi có thể có nhiều cách giải khác nhau</p>
                  <p>• Kiểm tra cú pháp SQL trước khi submit</p>
                  <p>• Thời gian làm bài sẽ được tính từ lúc bạn bắt đầu</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timer & Start */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Thời gian còn lại</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-mono font-semibold text-primary mb-2">
                    {timeRemaining}
                  </div>
                </div>

                <Button
                  onClick={handleStartContest}
                  disabled={!canStart || starting}
                  className="w-full"
                  size="lg"
                >
                  {starting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang khởi tạo...
                    </>
                  ) : canStart ? (
                    "Vào làm bài"
                  ) : (
                    "Chưa thể bắt đầu"
                  )}
                </Button>

                {!canStart && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
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
                  <span className="text-muted-foreground">Mã cuộc thi: </span>
                  {contestData.contestCode}
                </div>
                <div>
                  <span className="text-muted-foreground">Bắt đầu: </span>
                  {new Date(contestData.startDatetime).toLocaleString("vi-VN")}
                </div>
                <div>
                  <span className="text-muted-foreground">Kết thúc: </span>
                  {new Date(contestData.endDatetime).toLocaleString("vi-VN")}
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái: </span>
                  <Badge className={getStatusBadgeColor(contestData.status)}>
                    {getStatusText(contestData.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContestWaitingPage;
