import { BookOpen, Database, Target, Trophy } from "lucide-react";
import {
  ActivityData,
  PerformanceData,
  UpcomingExam,
  ScheduleItem,
  RecentActivity,
  OverviewStat,
  ProgressItem,
} from "../../../types/home";

// Mock data cho biểu đồ hoạt động với ngày thực tế hơn
const generateRecentDates = (days: number): string[] => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

export const activityData: ActivityData[] = generateRecentDates(7).map(
  (date) => ({
    date,
    quiz: Math.floor(Math.random() * 15) + 5, // 5-20 bài quiz
    sql: Math.floor(Math.random() * 12) + 3, // 3-15 bài SQL
  })
);

// Mock data cho hiệu suất
export const performanceData: PerformanceData[] = [
  { name: "Accepted", value: 65, color: "#10b981" },
  { name: "Wrong Answer", value: 20, color: "#ef4444" },
  { name: "Compile Error", value: 10, color: "#f59e0b" },
  { name: "Time Limit", value: 5, color: "#8b5cf6" },
];

// Mock data cho lịch thi sắp tới với ngày thực tế
const getUpcomingDates = () => {
  const today = new Date();
  const dates = [];

  // Thi midterm trong 3 ngày tới
  const midterm = new Date(today);
  midterm.setDate(today.getDate() + 3);
  dates.push(midterm.toISOString().split("T")[0]);

  // Quiz trong 5 ngày tới
  const quiz = new Date(today);
  quiz.setDate(today.getDate() + 5);
  dates.push(quiz.toISOString().split("T")[0]);

  // Final exam trong 10 ngày tới
  const finalExam = new Date(today);
  finalExam.setDate(today.getDate() + 10);
  dates.push(finalExam.toISOString().split("T")[0]);

  return dates;
};

export const upcomingExams: UpcomingExam[] = [
  {
    id: 1,
    title: "Midterm Database Systems",
    date: getUpcomingDates()[0],
    time: "09:00",
    type: "SQL",
  },
  {
    id: 2,
    title: "Quiz Programming Logic",
    date: getUpcomingDates()[1],
    time: "14:00",
    type: "Quiz",
  },
  {
    id: 3,
    title: "Final Exam SQL Advanced",
    date: getUpcomingDates()[2],
    time: "08:00",
    type: "SQL",
  },
];

// Mock data cho thời khóa biểu
export const scheduleData: ScheduleItem[] = [
  { time: "08:00", subject: "Database Systems", room: "A101", type: "lecture" },
  { time: "10:00", subject: "Programming Logic", room: "B205", type: "lab" },
  { time: "14:00", subject: "Data Structures", room: "C302", type: "lecture" },
  { time: "16:00", subject: "SQL Practice", room: "Lab 1", type: "practice" },
];

// Mock data cho hoạt động gần đây với thời gian thực tế
const getRecentTimes = () => {
  const times = [];

  // 2 giờ trước
  times.push(`${Math.floor(Math.random() * 2) + 1} giờ trước`);

  // 3-5 giờ trước
  times.push(`${Math.floor(Math.random() * 3) + 3} giờ trước`);

  // 6-8 giờ trước
  times.push(`${Math.floor(Math.random() * 3) + 6} giờ trước`);

  // 1 ngày trước
  times.push("1 ngày trước");

  return times;
};

export const recentActivities: RecentActivity[] = [
  {
    id: 1,
    type: "quiz",
    title: "Arrays and Loops",
    status: "AC",
    score: 85,
    time: getRecentTimes()[0],
  },
  {
    id: 2,
    type: "sql",
    title: "JOIN Operations",
    status: "AC",
    score: 92,
    time: getRecentTimes()[1],
  },
  {
    id: 3,
    type: "quiz",
    title: "Object-Oriented Programming",
    status: "WA",
    score: 65,
    time: getRecentTimes()[2],
  },
  {
    id: 4,
    type: "sql",
    title: "Aggregate Functions",
    status: "AC",
    score: 88,
    time: getRecentTimes()[3],
  },
];

// Mock data cho các thống kê tổng quan với tính toán thực tế hơn
const calculateTotalQuiz = () =>
  activityData.reduce((sum, item) => sum + item.quiz, 0);
const calculateTotalSQL = () =>
  activityData.reduce((sum, item) => sum + item.sql, 0);
const calculateAverageScore = () => {
  const totalScore = recentActivities.reduce(
    (sum, activity) => sum + activity.score,
    0
  );
  return Math.round((totalScore / recentActivities.length) * 10) / 10;
};

export const overviewStats: OverviewStat[] = [
  {
    title: "Tổng Quiz",
    value: calculateTotalQuiz(),
    change: "+12.5% so với tuần trước",
    changeType: "positive",
    icon: BookOpen,
  },
  {
    title: "SQL Hoàn Thành",
    value: calculateTotalSQL(),
    change: "+8.2% so với tuần trước",
    changeType: "positive",
    icon: Database,
  },
  {
    title: "Điểm Trung Bình",
    value: calculateAverageScore(),
    change: "+2.1% cải thiện",
    changeType: "positive",
    icon: Target,
  },
  {
    title: "Xếp Hạng",
    value: "#12",
    change: "+3 bậc trong lớp",
    changeType: "positive",
    icon: Trophy,
  },
];

// Mock data cho tiến độ học tập với tính toán dựa trên hoạt động
const quizProgress = Math.min(calculateTotalQuiz(), 30);
const sqlProgress = Math.min(calculateTotalSQL(), 25);

export const progressItems: ProgressItem[] = [
  {
    label: "Quiz Progress",
    current: quizProgress,
    total: 30,
    percentage: Math.round((quizProgress / 30) * 100),
    description: `${Math.round(
      (quizProgress / 30) * 100
    )}% hoàn thành mục tiêu tháng`,
  },
  {
    label: "SQL Progress",
    current: sqlProgress,
    total: 25,
    percentage: Math.round((sqlProgress / 25) * 100),
    description: `${Math.round(
      (sqlProgress / 25) * 100
    )}% hoàn thành mục tiêu tháng`,
  },
  {
    label: "Weekly Goal",
    current: 6,
    total: 8,
    percentage: 75,
    description: "75% mục tiêu tuần này",
  },
];

// Cấu hình chart với label tiếng Việt
export const chartConfig = {
  quiz: {
    label: "Quiz",
    color: "#3b82f6", // Blue
  },
  sql: {
    label: "SQL",
    color: "#10b981", // Emerald
  },
};
