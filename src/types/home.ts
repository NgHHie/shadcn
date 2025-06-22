export interface ActivityData {
  date: string;
  quiz: number;
  sql: number;
}

export interface PerformanceData {
  name: string;
  value: number;
  color: string;
}

export interface UpcomingExam {
  id: number;
  title: string;
  date: string;
  time: string;
  type: string;
}

export interface ScheduleItem {
  time: string;
  subject: string;
  room: string;
  type: "lecture" | "lab" | "practice";
}

export interface RecentActivity {
  id: number;
  type: "quiz" | "sql";
  title: string;
  status: "AC" | "WA" | "CE" | "TLE" | "RE";
  score: number;
  time: string;
}

export interface OverviewStat {
  title: string;
  value: string | number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
}

export interface ProgressItem {
  label: string;
  current: number;
  total: number;
  percentage: number;
  description: string;
}
