import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Users, ArrowRight, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApi, ExamQuiz } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

export function UpcomingExamQuizzesCard() {
  const { t } = useTranslation('home');
  const api = useApi();
  const [examQuizzes, setExamQuizzes] = useState<ExamQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExamQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user info to get userId
        const userInfo = await api.user.getUserInfo();
        
        // Fetch upcoming exam quizzes
        const response = await api.mcs.getUpcomingExamQuizzes(userInfo.id);
        setExamQuizzes(response.data || []);
      } catch (err: unknown) {
        console.error('Failed to fetch exam quizzes:', err);
        
        // Check if this is the "No exams found" case
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isNoExamsFound = errorMessage.includes('No exams found');
        
        if (isNoExamsFound) {
          // This is not an error, just no exams available
          setExamQuizzes([]);
          setError(null);
        } else {
          // This is a real error
          setError(t('upcomingExamQuizzes.loadError'));
          setExamQuizzes([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExamQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove api dependency to prevent infinite calls - useApi() creates new object on each render

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getDurationMinutes = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  const getTimeStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      const hoursUntilStart = Math.floor((start.getTime() - now.getTime()) / (1000 * 60 * 60));
      if (hoursUntilStart < 24) {
        return { status: 'soon', label: `${t('upcomingExamQuizzes.timeStatus.remaining')} ${hoursUntilStart}${t('upcomingExamQuizzes.timeStatus.hours')}`, color: 'destructive' };
      } else {
        const daysUntilStart = Math.floor(hoursUntilStart / 24);
        return { status: 'upcoming', label: `${t('upcomingExamQuizzes.timeStatus.remaining')} ${daysUntilStart} ${t('upcomingExamQuizzes.timeStatus.days')}`, color: 'secondary' };
      }
    } else if (now >= start && now <= end) {
      return { status: 'ongoing', label: t('upcomingExamQuizzes.timeStatus.ongoing'), color: 'default' };
    } else {
      return { status: 'ended', label: t('upcomingExamQuizzes.timeStatus.ended'), color: 'outline' };
    }
  };

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" />
            {t('upcomingExamQuizzes.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex-1">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-3 border rounded-lg space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" />
            {t('upcomingExamQuizzes.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex-1">
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
          <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" />
            {t('upcomingExamQuizzes.title')}
            {examQuizzes.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {examQuizzes.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-y-auto">
        {examQuizzes.length > 0 ? (
          <div className="space-y-3">
            {examQuizzes.map((quiz) => {
              const startDateTime = formatDateTime(quiz.startTime);
              const endDateTime = formatDateTime(quiz.endTime);
              const duration = getDurationMinutes(quiz.startTime, quiz.endTime);
              const timeStatus = getTimeStatus(quiz.startTime, quiz.endTime);

              return (
                <div key={quiz.examQuizzesId} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-2">
                        {quiz.title}
                      </h4>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{startDateTime.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{startDateTime.time} - {endDateTime.time} ({duration} {t('upcomingExamQuizzes.duration')})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{quiz.totalQuestions} {t('upcomingExamQuizzes.questions')}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <Badge 
                          variant={timeStatus.color as "destructive" | "secondary" | "default" | "outline"} 
                          className="text-xs px-2 py-0"
                        >
                          {timeStatus.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          {quiz.code}
                        </Badge>
                      </div>
                    </div>

                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="shrink-0"
                      onClick={() => {
                        // Navigate to quiz detail or exam page
                        window.location.href = `/quiz/${quiz.examQuizzesId}`;
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">{t('upcomingExamQuizzes.noExams')}</p>
            <p className="text-xs">{t('upcomingExamQuizzes.noExamsDesc')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 