import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChartContainer } from "@/components/ui/chart";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Award, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { performanceData, recentActivities } from "../../app/home/data/mockData";

export function PerformanceCard() {
  const { t } = useTranslation('home');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AC":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "WA":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    return type === "quiz" 
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4" />
          {t('performance.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 flex-1 overflow-y-auto">
        {/* Performance Pie Chart */}
        <div>
          <h4 className="text-sm font-medium mb-2">{t('performance.sqlResults')}</h4>
          <div className="flex items-center justify-between">
            <ChartContainer config={{}} className="h-[80px] w-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={15}
                    outerRadius={35}
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="space-y-0.5 text-xs">
              {performanceData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Recent Activities */}
        <div>
          <h4 className="text-sm font-medium mb-2">{t('performance.recentActivities')}</h4>
          <div className="space-y-1.5">
            {recentActivities.slice(0, 3).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(activity.status)}
                  <span className="font-medium">{activity.title}</span>
                  <Badge variant="outline" className={`${getTypeColor(activity.type)} text-xs px-1 py-0`}>
                    {activity.type.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-medium">{activity.score}%</div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 