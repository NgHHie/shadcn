import { OverviewCards } from "../../components/home/OverviewCards";
import { ActivityChart } from "../../components/home/ActivityChart";
import { ScheduleCard } from "../../components/home/ScheduleCard";
import { UpcomingExamsCard } from "../../components/home/UpcomingExamsCard";
import { PerformanceCard } from "../../components/home/PerformanceCard";
import { ProgressSection } from "../../components/home/ProgressSection";
import { RecentActivitiesFeed } from "../../components/home/RecentActivitiesFeed";

export function HomePage() {
  return (
    <div className="space-y-6 p-6">
      {/* Overview Cards */}
      <OverviewCards />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* First Row - ActivityChart + ScheduleCard */}
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        
        <div className="lg:col-span-1">
          <ScheduleCard />
        </div>

        {/* Second Row - Three cards with auto height */}
        <div className="lg:col-span-1">
          <RecentActivitiesFeed />
        </div>
        
        <div className="lg:col-span-1">
          <PerformanceCard />
        </div>
        
        <div className="lg:col-span-1">
          <UpcomingExamsCard />
        </div>
      </div>

      {/* Progress Section */}
      <ProgressSection />
    </div>
  );
}

// Export default cho dễ import
export default HomePage;
