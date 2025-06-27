import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  History,
  Trophy
} from "lucide-react";
import { useEffect, useState } from 'react';
import { useApi, QuizSubmission } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

export function RecentQuizSubmissions() {
  const { t } = useTranslation('home');
  const api = useApi();
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user info to get userId
        const userInfo = await api.user.getUserInfo();
        
        // Fetch quiz submission history
        const response = await api.mcs.getQuizSubmissionHistory(userInfo.id);
        // Sort by endTimeAt descending and take first 5
        const sortedSubmissions = (response.data || [])
          .sort((a, b) => new Date(b.endTimeAt).getTime() - new Date(a.endTimeAt).getTime())
          .slice(0, 5);
        setSubmissions(sortedSubmissions);
      } catch (err: unknown) {
        console.error('Failed to fetch quiz submissions:', err);
        
        // Check if this is the "No submissions found" case
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isNoSubmissionsFound = errorMessage.includes('No submissions found') || errorMessage.includes('No history found');
        
        if (isNoSubmissionsFound) {
          // This is not an error, just no submissions available
          setSubmissions([]);
          setError(null);
        } else {
          // This is a real error
          setError(t('recentQuizSubmissions.loadError'));
          setSubmissions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove api dependency to prevent infinite calls - useApi() creates new object on each render

  const getTimeAgo = (dateTime: string) => {
    const now = new Date();
    const date = new Date(dateTime);
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) {
      return t('timeAgo.justNow');
    } else if (hours < 24) {
      return `${hours} ${t('timeAgo.hoursAgo')}`;
    } else {
      return `${days} ${t('timeAgo.dayAgo')}`;
    }
  };

  const getScoreStatus = (score: number, totalQuestions: number) => {
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    
    if (percentage >= 80) {
      return { status: 'excellent', color: 'bg-green-500', textColor: 'text-green-600', label: t('recentQuizSubmissions.status.excellent') };
    } else if (percentage >= 60) {
      return { status: 'good', color: 'bg-blue-500', textColor: 'text-blue-600', label: t('recentQuizSubmissions.status.good') };
    } else if (percentage >= 40) {
      return { status: 'average', color: 'bg-yellow-500', textColor: 'text-yellow-600', label: t('recentQuizSubmissions.status.average') };
    } else {
      return { status: 'poor', color: 'bg-red-500', textColor: 'text-red-600', label: t('recentQuizSubmissions.status.poor') };
    }
  };

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-primary" />
            {t('recentQuizSubmissions.title')}
          </CardTitle>
          <CardDescription className="text-xs">
            {t('recentQuizSubmissions.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex-1">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
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
            <History className="h-4 w-4 text-primary" />
            {t('recentQuizSubmissions.title')}
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-primary" />
              {t('recentQuizSubmissions.title')}
              {submissions.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {submissions.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('recentQuizSubmissions.description')}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7">
            {t('recentQuizSubmissions.viewAll')}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-y-auto">
        {submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((submission) => {
              const scoreStatus = getScoreStatus(submission.countCorrectAnswers, submission.totalQuestions);
              const percentage = submission.totalQuestions > 0 
                ? Math.round((submission.countCorrectAnswers / submission.totalQuestions) * 100) 
                : 0;

              return (
                <div 
                  key={submission.examQuizzSubmissionId} 
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className={`p-1.5 rounded-full ${scoreStatus.color}/10 flex-shrink-0`}>
                    {percentage >= 50 ? (
                      <CheckCircle2 className={`h-3 w-3 ${scoreStatus.color.replace('bg-', 'text-')}`} />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs line-clamp-1 group-hover:text-primary">
                      {t('recentQuizSubmissions.quiz')} #{submission.examQuizzSubmissionId.slice(-8)}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {submission.countCorrectAnswers}/{submission.totalQuestions} {t('recentQuizSubmissions.correctAnswers')} • {percentage}%
                    </p>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(submission.endTimeAt)}
                      </span>
                      <Badge variant="outline" className={`text-xs px-1 py-0 ${scoreStatus.textColor} border-current`}>
                        {scoreStatus.label}
                      </Badge>
                      {percentage === 100 && (
                        <Trophy className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">{t('recentQuizSubmissions.noSubmissions')}</p>
            <p className="text-xs">{t('recentQuizSubmissions.noSubmissionsDesc')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 