"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";

// Type definitions cho API response
interface SubmitHistoryItem {
  id: string;
  createdAt: string;
  timeSubmit: string;
  status: "AC" | "WA" | "CE" | "TLE" | "RE";
  user: {
    firstName: string;
    lastName: string;
    userCode: string;
    fullName: string;
  };
  testPass: number;
  totalTest: number;
  question: {
    questionCode: string;
    title: string;
  };
  database: {
    id: string;
    name: string;
  };
}

interface ApiResponse {
  content: SubmitHistoryItem[];
  totalElements: number;
  totalPages: number;
}

// Chart data interface
interface ChartData {
  date: string;
  accepted: number;
  rejected: number;
}

const chartConfig = {
  visitors: {
    label: "Hoạt động",
  },
  accepted: {
    label: "Đúng (Accepted)",
    color: "hsl(142, 76%, 36%)", // Green color for AC
  },
  rejected: {
    label: "Sai (Rejected)",
    color: "hsl(0, 84%, 60%)", // Red color for rejected
  },
} satisfies ChartConfig;

// Utility function để format date thành YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Utility function để group data theo ngày
const groupSubmissionsByDate = (
  submissions: SubmitHistoryItem[]
): ChartData[] => {
  const groupedData: { [key: string]: { accepted: number; rejected: number } } =
    {};

  console.log("Processing", submissions.length, "submissions");

  submissions.forEach((submission) => {
    const date = formatDate(new Date(submission.timeSubmit));

    if (!groupedData[date]) {
      groupedData[date] = { accepted: 0, rejected: 0 };
    }

    if (submission.status === "AC") {
      groupedData[date].accepted++;
    } else {
      groupedData[date].rejected++;
    }
  });

  // Convert object to array và sort theo date
  return Object.entries(groupedData)
    .map(([date, counts]) => ({
      date,
      accepted: counts.accepted,
      rejected: counts.rejected,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Utility function để filter data theo time range
const filterDataByTimeRange = (
  data: ChartData[],
  timeRange: string
): ChartData[] => {
  const now = new Date();
  let daysToSubtract = 90;

  if (timeRange === "30d") {
    daysToSubtract = 30;
  } else if (timeRange === "7d") {
    daysToSubtract = 7;
  }

  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - daysToSubtract);

  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate;
  });
};

// API service functions
const fetchUserInfo = async (): Promise<{ id: string }> => {
  try {
    const token = localStorage.getItem("access_token")?.replace(/"/g, "");

    const response = await fetch(
      "https://api.learnsql.store/api/app/user/info",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

const fetchSubmitHistory = async (userId: string): Promise<ApiResponse> => {
  try {
    const token = localStorage.getItem("access_token")?.replace(/"/g, "");

    // First call to get total count
    const firstResponse = await fetch(
      `https://api.learnsql.store/api/app/submit-history/user/filter/${userId}?page=0&size=20`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!firstResponse.ok) {
      throw new Error(`HTTP error! status: ${firstResponse.status}`);
    }

    const firstData = await firstResponse.json();
    const totalElements = firstData.totalElements;

    console.log("Total submissions:", totalElements);

    // If we have more than 20 items, fetch all data
    if (totalElements > 20) {
      // Use a large size to get all data at once
      const url = `https://api.learnsql.store/api/app/submit-history/user/filter/${userId}?page=0&size=${totalElements}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    }

    // If 20 or fewer items, return the first response
    return firstData;
  } catch (error) {
    console.error("Error fetching submit history:", error);
    throw error;
  }
};

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Fetch data from API
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First get user info to get userId
        const userInfo = await fetchUserInfo();
        setUserId(userInfo.id);

        // Then fetch submit history
        const response = await fetchSubmitHistory(userInfo.id);

        // Filter submissions to only last 3 months from current date
        const currentDate = new Date();
        const threeMonthsAgo = new Date(currentDate);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        console.log("Current date:", currentDate.toISOString().split("T")[0]);
        console.log(
          "3 months ago cutoff:",
          threeMonthsAgo.toISOString().split("T")[0]
        );
        console.log("Total submissions from API:", response.content.length);

        // Filter submissions within last 3 months
        const recentSubmissions = response.content.filter((submission) => {
          const submissionDate = new Date(submission.timeSubmit);
          return (
            submissionDate >= threeMonthsAgo && submissionDate <= currentDate
          );
        });

        console.log("Submissions in last 3 months:", recentSubmissions.length);

        // Process only the recent submissions
        const processedData = groupSubmissionsByDate(recentSubmissions);
        setChartData(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Error loading submit history:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredData = React.useMemo(() => {
    return filterDataByTimeRange(chartData, timeRange);
  }, [chartData, timeRange]);

  // Calculate Y-axis domain with nice intervals (divisible by 5 or 10)
  const yAxisDomain = React.useMemo(() => {
    if (chartData.length === 0) return [0, 10];

    // Find max submissions in one day
    const maxSubmissionsInOneDay = Math.max(
      ...chartData.map((item) => item.accepted + item.rejected)
    );

    console.log("Max submissions in one day:", maxSubmissionsInOneDay);

    // Simply round up to next nice number
    let yMax;
    if (maxSubmissionsInOneDay <= 50) {
      // For numbers ≤ 50, round up to next multiple of 5
      yMax = Math.ceil(maxSubmissionsInOneDay / 5) * 5;
    } else {
      // For numbers > 50, round up to next multiple of 10
      yMax = Math.ceil(maxSubmissionsInOneDay / 10) * 10;
    }

    // Ensure minimum scale
    yMax = Math.max(yMax, 10);

    console.log("Y-axis max:", yMax);

    return [0, yMax];
  }, [chartData]);

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Thống kê hoạt động</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              {/* Modern loading spinner */}

              <Loader2 className="h-14 w-14 animate-spin text-muted-foreground" />

              {/* Loading text */}
              <div className="text-center space-y-2">
                <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Đang tải dữ liệu
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Vui lòng đợi trong giây lát...
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Thống kê hoạt động</CardTitle>
          <CardDescription>Lỗi khi tải dữ liệu</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center">
            <div className="text-red-500">Lỗi: {error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Thống kê hoạt động</CardTitle>
          </div>

          {/* Bộ chọn thời gian */}
          <div className="flex justify-end">
            {/* Desktop */}
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden @[767px]/card:flex"
            >
              <ToggleGroupItem value="90d" className="h-8 px-2.5">
                3 tháng qua
              </ToggleGroupItem>
              <ToggleGroupItem value="30d" className="h-8 px-2.5">
                30 ngày qua
              </ToggleGroupItem>
              <ToggleGroupItem value="7d" className="h-8 px-2.5">
                7 ngày qua
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Mobile */}
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="flex w-40 @[767px]/card:hidden"
                aria-label="Chọn khoảng thời gian"
              >
                <SelectValue placeholder="3 tháng qua" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">
                  3 tháng qua
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  30 ngày qua
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  7 ngày qua
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full pr-4"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAccepted" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRejected" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(0, 84%, 60%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(0, 84%, 60%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              interval={0}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("vi-VN", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={yAxisDomain}
              allowDataOverflow={false}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("vi-VN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="accepted"
              type="natural"
              fill="url(#fillAccepted)"
              stroke="hsl(142, 76%, 36%)"
              fillOpacity={0.6}
            />
            <Area
              dataKey="rejected"
              type="natural"
              fill="url(#fillRejected)"
              stroke="hsl(0, 84%, 60%)"
              fillOpacity={0.6}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
