import { Trophy, Clock, Medal, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Leaderboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800/50 rounded-lg p-1 backdrop-blur-sm">
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Hàng ngày
            </Button>
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-white px-6 py-2 rounded-md"
            >
              Hàng tháng
            </Button>
          </div>
        </div>

        {/* Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8 items-end">
          {/* 2nd Place */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 text-center backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <span className="text-2xl font-bold">2</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">HocSinh123</h3>
            <div className="flex items-center justify-center gap-1 mb-2">
              <Medal className="w-4 h-4 text-silver" />
              <span className="text-sm text-slate-400">
                Hoàn thành 15 bài tập
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 text-blue-400 font-bold">
              <Trophy className="w-4 h-4" />
              <span>5,000</span>
            </div>
            <p className="text-xs text-slate-500">Điểm thưởng</p>
          </Card>

          {/* 1st Place */}
          <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/30 p-6 text-center backdrop-blur-sm transform scale-105">
            <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">ThanhVien_VIP</h3>
            <div className="flex items-center justify-center gap-1 mb-2">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Nộp 25 bài tập</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-yellow-400 font-bold text-lg">
              <Trophy className="w-5 h-5" />
              <span>10,000</span>
            </div>
            <p className="text-xs text-slate-400">Điểm thưởng</p>
          </Card>

          {/* 3rd Place */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 text-center backdrop-blur-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
              <span className="text-2xl font-bold">3</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">HocTap247</h3>
            <div className="flex items-center justify-center gap-1 mb-2">
              <Medal className="w-4 h-4 text-bronze" />
              <span className="text-sm text-slate-400">
                Hoàn thành 12 bài tập
              </span>
            </div>
            <div className="flex items-center justify-center gap-1 text-blue-400 font-bold">
              <Trophy className="w-4 h-4" />
              <span>2,500</span>
            </div>
            <p className="text-xs text-slate-500">Điểm thưởng</p>
          </Card>
        </div>

        {/* Countdown Timer */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Thời gian còn lại</span>
          </div>
          <div className="text-2xl font-mono font-bold">00d 00h 43m 51s</div>
        </div>

        {/* User Status */}
        <div className="text-center mb-8">
          <div className="bg-slate-800/30 rounded-lg p-3 backdrop-blur-sm inline-block">
            <span className="text-slate-400">Bạn đã kiếm được </span>
            <span className="text-blue-400 font-bold">₫ 50</span>
            <span className="text-slate-400">
              {" "}
              hôm nay và đang xếp hạng - ngoài top{" "}
            </span>
            <span className="text-white font-bold">13568 học viên</span>
          </div>
        </div>

        {/* Leaderboard Table */}
        <Card className="bg-slate-800/30 border-slate-700 backdrop-blur-sm">
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-slate-400 mb-4 border-b border-slate-700 pb-2">
              <div>Hạng</div>
              <div>Tên học viên</div>
              <div>Điểm số</div>
              <div className="text-right">Thưởng</div>
            </div>

            {[
              { rank: 4, name: "HocVien_A", points: 156, prize: 750 },
              { rank: 5, name: "SinhVien_B", points: 156, prize: 750 },
              { rank: 6, name: "HocTap_C", points: 156, prize: 750 },
            ].map((user) => (
              <div
                key={user.rank}
                className="grid grid-cols-4 gap-4 py-3 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold">{user.rank}</span>
                </div>
                <div className="text-slate-300">{user.name}</div>
                <div className="text-slate-300">{user.points}</div>
                <div className="text-right">
                  <span className="text-blue-400 font-semibold">
                    ₫ {user.prize}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
