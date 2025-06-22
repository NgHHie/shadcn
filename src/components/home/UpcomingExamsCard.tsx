import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { upcomingExams } from "../../app/home/data/mockData";

export function UpcomingExamsCard() {
  const { t } = useTranslation('home');

  const getTypeColor = (type: string) => {
    return type.toLowerCase() === "quiz" 
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          {t('exams.title')}
        </CardTitle>
        <CardDescription className="text-xs">
          {t('exams.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-y-auto">
        {upcomingExams.length > 0 ? (
          <div className="space-y-2">
            {upcomingExams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-2 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">{exam.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(exam.date).toLocaleDateString('vi-VN')} • {exam.time}
                  </div>
                </div>
                <Badge className={getTypeColor(exam.type)} variant="outline">
                  {exam.type}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">{t('exams.noExams')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 