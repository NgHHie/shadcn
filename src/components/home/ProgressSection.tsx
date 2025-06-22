import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";

export function ProgressSection() {
  const { t } = useTranslation('home');

  const progressItems = [
    {
      label: t('progress.quizProgress'),
      current: 24,
      total: 30,
      percentage: 80,
      description: `80% ${t('progress.monthlyGoalComplete')}`,
    },
    {
      label: t('progress.sqlProgress'),
      current: 18,
      total: 25,
      percentage: 72,
      description: `72% ${t('progress.monthlyGoalComplete')}`,
    },
    {
      label: t('progress.weeklyGoal'),
      current: 6,
      total: 8,
      percentage: 75,
      description: `75% ${t('progress.weeklyGoalComplete')}`,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('progress.title')}</CardTitle>
        <CardDescription className="text-xs">{t('progress.description')}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3 md:grid-cols-3">
          {progressItems.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>{item.label}</span>
                <span>{item.current}/{item.total}</span>
              </div>
              <Progress value={item.percentage} className="h-1.5" />
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 