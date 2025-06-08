import { useState } from "react";
import { Trophy, Star, Crown, Award, Users, Target } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { z } from "zod";

// Schema định nghĩa với trường questionsAnswered mới
export const schema = z.object({
  id: z.number(),
  rank: z.number(),
  name: z.string(),
  points: z.number(),
  weeklyPoints: z.number(),
  monthlyPoints: z.number(),
  questionsAnswered: z.number(),
  avatar: z.string(),
  period: z.string(),
});

type SchemaType = z.infer<typeof schema>;

export function Leaderboard({ data }: { data: SchemaType[] }) {
  const [selectedPeriod, setSelectedPeriod] = useState<"weekly" | "monthly">(
    "weekly"
  );

  // Filter data theo period
  const filteredData = data.filter((item) => item.period === selectedPeriod);

  // Lấy top 3
  const topThree = filteredData.slice(0, 3);

  // Lấy remaining users (từ rank 4 trở đi)
  const otherUsers = filteredData.slice(3);

  // Current user data (giả định)
  const currentUser = {
    weeklyPoints: 450,
    monthlyPoints: 1580,
    weeklyRank: 156,
    monthlyRank: 89,
    questionsAnswered: 24,
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500 drop-shadow-lg" />;
      case 2:
        return <Award className="w-5 h-5 text-gray-400 drop-shadow-lg" />;
      case 3:
        return <Star className="w-5 h-5 text-amber-600 drop-shadow-lg" />;
      default:
        return (
          <span className="text-lg font-bold text-muted-foreground">
            {rank}
          </span>
        );
    }
  };

  const getPodiumStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 shadow-2xl shadow-yellow-500/30";
      case 2:
        return "bg-gradient-to-br from-gray-400/20 to-gray-600/20 border-gray-400/30 shadow-xl shadow-gray-400/25";
      case 3:
        return "bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-600/30 shadow-xl shadow-amber-600/25";
      default:
        return "bg-card border-border";
    }
  };

  const currentUserPoints =
    selectedPeriod === "weekly"
      ? currentUser.weeklyPoints
      : currentUser.monthlyPoints;
  const currentUserRank =
    selectedPeriod === "weekly"
      ? currentUser.weeklyRank
      : currentUser.monthlyRank;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header với animation */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bảng xếp hạng
          </h1>
          <p className="text-muted-foreground">
            Theo dõi thứ hạng và điểm số của bạn so với các học viên khác
          </p>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        {/* Period Toggle với animation */}
        <div className="flex justify-center mb-8">
          <ToggleGroup
            type="single"
            value={selectedPeriod}
            onValueChange={(value) =>
              setSelectedPeriod(value as "weekly" | "monthly")
            }
            variant="outline"
          >
            <ToggleGroupItem value="weekly" className="h-8 px-4">
              Hàng tuần
            </ToggleGroupItem>
            <ToggleGroupItem value="monthly" className="h-8 px-4">
              Hàng tháng
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Podium với staggered animation */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl md:items-end">
            {topThree.map((user) => {
              const actualRank = user.rank;
              const order =
                actualRank === 1
                  ? "order-1 md:order-2"
                  : actualRank === 2
                  ? "order-2 md:order-1"
                  : "order-3";

              return (
                <Card
                  key={user.id}
                  className={`p-4 md:p-6 text-center hover:scale-105 transition-transform duration-200 ${getPodiumStyle(
                    actualRank
                  )} ${order}`}
                >
                  <CardContent className="p-0">
                    <div className="flex justify-center mb-2">
                      {getRankIcon(actualRank)}
                    </div>
                    <div
                      className={`mx-auto mb-4 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl ${
                        actualRank === 1
                          ? "w-20 h-20 from-yellow-500 to-orange-500"
                          : "w-16 h-16 from-gray-400 to-gray-600"
                      } ${
                        actualRank === 3 ? "from-amber-600 to-orange-600" : ""
                      }`}
                    >
                      {user.avatar}
                    </div>
                    <h3
                      className={`font-semibold mb-2 ${
                        actualRank === 1 ? "text-xl font-bold" : "text-lg"
                      }`}
                    >
                      {user.name}
                    </h3>
                    <div
                      className={`flex items-center justify-center gap-1 font-bold mb-2 ${
                        actualRank === 1
                          ? "text-yellow-500 text-lg"
                          : "text-primary"
                      }`}
                    >
                      <Trophy
                        className={`${
                          actualRank === 1 ? "w-5 h-5" : "w-4 h-4"
                        }`}
                      />
                      <span>
                        {(selectedPeriod === "weekly"
                          ? user.weeklyPoints
                          : user.monthlyPoints
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Target className="w-3 h-3" />
                      <span>{user.questionsAnswered} câu</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* User Status với animation */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">Thống kê của bạn</span>
              </div>
              <p className="text-muted-foreground">
                Bạn đã kiếm được{" "}
                <span className="text-primary font-bold">
                  {currentUserPoints.toLocaleString()}
                </span>{" "}
                điểm {selectedPeriod === "weekly" ? "tuần này" : "tháng này"},
                hoàn thành{" "}
                <span className="text-primary font-bold">
                  {currentUser.questionsAnswered}
                </span>{" "}
                câu hỏi và đang xếp hạng{" "}
                <Badge variant="secondary" className="font-bold">
                  #{currentUserRank}
                </Badge>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Table với animation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Bảng xếp hạng{" "}
              {selectedPeriod === "weekly" ? "hàng tuần" : "hàng tháng"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted">
                  <TableRow>
                    <TableHead className="w-20">Hạng</TableHead>
                    <TableHead>Tên học viên</TableHead>
                    <TableHead className="text-center">Số câu</TableHead>
                    <TableHead className="text-right">Điểm số</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-sidebar-accent transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRankIcon(user.rank)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                          <Target className="w-3 h-3" />
                          <span>{user.questionsAnswered}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Trophy className="w-4 h-4 text-primary" />
                          <span className="font-semibold">
                            {(selectedPeriod === "weekly"
                              ? user.weeklyPoints
                              : user.monthlyPoints
                            ).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
