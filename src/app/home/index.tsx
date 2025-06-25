import { ScheduleCard } from "../../components/home/ScheduleCard";
import { UpcomingExamsCard } from "../../components/home/UpcomingExamsCard";
import { RecentActivitiesFeed } from "../../components/home/RecentActivitiesFeed";
import { PracticeSuggestionsCard } from "../../components/home/PracticeSuggestionsCard";
import { ScheduleWeekTable } from "../../components/home/ScheduleWeekTable";
import { useEffect, useState } from "react";
import { scheduleApi, ScheduleClass } from "@/lib/api";

export function HomePage() {
  const [weekClasses, setWeekClasses] = useState<ScheduleClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scheduleApi.getSchedule()
      .then(res => setWeekClasses(Array.isArray(res?.classes) ? res.classes : []))
      .catch(() => setWeekClasses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <ScheduleCard />
          <div className="bg-card rounded-xl p-4 border">
            <div className="font-semibold mb-2 text-base">Thời khóa biểu tuần này</div>
            {loading ? (
              <div className="text-muted-foreground text-sm">Đang tải thời khóa biểu...</div>
            ) : (
              <ScheduleWeekTable classes={weekClasses} />
            )}
          </div>
        </div>
        <UpcomingExamsCard />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivitiesFeed />
        <PracticeSuggestionsCard />
      </div>
    </div>
  );
}

// Export default cho dễ import
export default HomePage;
