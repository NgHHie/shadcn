// src/components/contest/contest-joined-header.tsx
import { Trophy, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContestJoinedHeaderProps {
  contestName: string;
  contestCode: string;
  onBack: () => void;
  onRefresh: () => void;
}

export function ContestJoinedHeader({
  contestName,
  contestCode,
  onBack,
  onRefresh,
}: ContestJoinedHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold">{contestName}</h1>
          <p className="text-muted-foreground">Mã: {contestCode}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onBack}>
          <Home className="h-4 w-4 mr-2" />
          Về trang chủ
        </Button>
        <Button variant="outline" onClick={onRefresh}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>
    </div>
  );
}
