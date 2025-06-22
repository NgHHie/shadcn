import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { BookOpen, Database, Target, Trophy } from "lucide-react";

export function OverviewCards() {
  const { t } = useTranslation('home');

  const overviewStats = [
    {
      title: t('overview.totalQuiz'),
      value: 24,
      change: `+12.5% ${t('overview.comparedToLastWeek')}`,
      changeType: "positive" as const,
      icon: BookOpen,
    },
    {
      title: t('overview.completedSQL'),
      value: 18,
      change: `+8.2% ${t('overview.comparedToLastWeek')}`,
      changeType: "positive" as const,
      icon: Database,
    },
    {
      title: t('overview.averageScore'),
      value: 85.2,
      change: `+2.1% ${t('overview.improvement')}`,
      changeType: "positive" as const,
      icon: Target,
    },
    {
      title: t('overview.currentRank'),
      value: "#12",
      change: `+3 ${t('overview.rankUp')}`,
      changeType: "positive" as const,
      icon: Trophy,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {overviewStats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span 
                  className={
                    stat.changeType === "positive" 
                      ? "text-green-600" 
                      : stat.changeType === "negative" 
                      ? "text-red-600" 
                      : "text-muted-foreground"
                  }
                >
                  {stat.change}
                </span>
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 