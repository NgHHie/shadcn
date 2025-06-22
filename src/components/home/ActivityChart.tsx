import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Activity, BookOpen, Database } from "lucide-react";
import { useTranslation } from "react-i18next";
import { activityData, chartConfig } from "../../app/home/data/mockData";

type TimeRange = '7d' | '30d' | '3m' | '1y';

interface ActivityChartProps {
  loading?: boolean;
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

export function ActivityChart({ loading = false }: ActivityChartProps) {
  const { t } = useTranslation('home');
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d');

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '7d', label: t('activity.timeRanges.7d') },
    { value: '30d', label: t('activity.timeRanges.30d') },
    { value: '3m', label: t('activity.timeRanges.3m') },
    { value: '1y', label: t('activity.timeRanges.1y') }
  ];

  // Filter data based on selected range (simplified logic)
  const getFilteredData = () => {
    // In real app, this would filter actual data based on time range
    // For now, return same mock data
    return activityData;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-sm mb-2">
            {label && new Date(label).toLocaleDateString('vi-VN', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          {payload.map((entry: TooltipPayload, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize">{entry.dataKey}:</span>
              <span className="font-semibold">
                {entry.value} {entry.dataKey === 'quiz' ? 'bài' : 'bài tập'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-7 w-12" />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-[320px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              {t('activity.title')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('activity.description')}
            </CardDescription>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-1">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? "default" : "outline"}
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Quiz (số bài)</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>SQL (số bài tập)</span>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="flex-1 min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={getFilteredData()}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                label={{ 
                  value: 'Số lượng (bài)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: '11px', fill: '#6b7280' }
                }}
                className="text-muted-foreground"
              />
              <ChartTooltip content={<CustomTooltip />} />
              
              {/* Bar chart for Quiz */}
              <Bar
                dataKey="quiz"
                fill={chartConfig.quiz.color}
                name="Quiz"
                radius={[2, 2, 0, 0]}
                opacity={0.8}
              />
              
              {/* Line chart for SQL */}
              <Line
                type="monotone"
                dataKey="sql"
                stroke={chartConfig.sql.color}
                strokeWidth={3}
                dot={{ 
                  fill: chartConfig.sql.color, 
                  strokeWidth: 2, 
                  r: 4 
                }}
                activeDot={{ 
                  r: 6, 
                  stroke: chartConfig.sql.color,
                  strokeWidth: 2,
                  fill: 'white'
                }}
                name="SQL"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Summary stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Tổng Quiz: <strong className="text-blue-600">{getFilteredData().reduce((sum, item) => sum + item.quiz, 0)} bài</strong></span>
            <span>Tổng SQL: <strong className="text-emerald-600">{getFilteredData().reduce((sum, item) => sum + item.sql, 0)} bài tập</strong></span>
          </div>
          <span className="text-muted-foreground">
            Khoảng thời gian: {timeRanges.find(r => r.value === selectedRange)?.label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
} 