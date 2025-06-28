import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, User, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSchedule } from "@/hooks/use-schedule";
import { ScheduleCountdown } from "./ScheduleCountdown";

interface ScheduleCardProps {
  loading?: boolean;
}

export function ScheduleCard({ loading: externalLoading }: ScheduleCardProps) {
  const { t, i18n } = useTranslation('home');
  const navigate = useNavigate();
  const { todayClasses, loading, error, refetch } = useSchedule();

  // Use external loading prop if provided, otherwise use hook loading
  const isLoading = externalLoading !== undefined ? externalLoading : loading;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <Badge className="bg-primary text-primary-foreground">{t('schedule.ongoing')}</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="border-primary text-primary">{t('schedule.upcoming')}</Badge>;
      case 'completed':
        return <Badge variant="secondary">{t('schedule.completed')}</Badge>;
      default:
        return null;
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate duration in minutes and format
  const formatDuration = (duration: number) => {
    const totalMinutes = duration * 45; // 1 tiết = 45 phút
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}ph`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}ph`;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return '📚';
      case 'lab':
        return '💻';
      case 'practice':
        return '✏️';
      default:
        return '📖';
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg border">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              {t('schedule.title')}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            {getCurrentTime()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center py-8 text-center">
            <div className="space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                {t('schedule.loadError')}
              </p>
              <Button variant="outline" size="sm" onClick={refetch}>
                {t('schedule.retry')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              {t('schedule.title')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-primary text-primary bg-primary/10">
                {todayClasses.length} {t('schedule.periods')}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={refetch}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            {getCurrentTime()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {todayClasses.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-center">
              <div className="space-y-2">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {t('schedule.noClasses')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('schedule.noClassesSubtitle')}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Timeline visualization */}
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-primary/20"></div>
                
                <div className="space-y-3">
                  {todayClasses.slice(0, 3).map((classItem) => (
                    <div key={classItem.id} className="relative">
                      {/* Timeline dot */}
                      <div 
                        className="absolute left-2 w-2.5 h-2.5 rounded-full border border-primary bg-primary z-10"
                      />
                      
                      <div 
                        className="group ml-6 p-3 rounded-lg border-l-3 bg-card hover:shadow-sm transition-all cursor-pointer border-l-primary"
                      >
                        <div className="space-y-2">
                          {/* Time and Status */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono font-medium">
                                {classItem.startTime} - {classItem.endTime}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({formatDuration(classItem.duration)})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {classItem.status === 'upcoming' && (
                                <ScheduleCountdown startTime={classItem.startTime} />
                              )}
                              {getStatusBadge(classItem.status)}
                            </div>
                          </div>
                          
                          {/* Subject */}
                          <h4 className="font-semibold text-sm line-clamp-1 mb-1">
                            {getTypeIcon(classItem.type)} {classItem.subject}
                          </h4>
                          
                          {/* Details - More compact */}
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span className="font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
                                {classItem.code}
                              </span>
                              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
                                {classItem.duration} tiết
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help underline decoration-dotted">
                                    {classItem.room}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">{classItem.roomFullName}</p>
                                </TooltipContent>
                              </Tooltip>
                              <span>• {classItem.building}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{classItem.instructor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {todayClasses.length > 3 && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    {t('schedule.andMore', { count: todayClasses.length - 3 })}
                  </p>
                </div>
              )}
            </>
          )}
          
          <Button 
            variant="default" 
            className="w-full justify-between hover:bg-primary/90 mt-3 h-8 text-xs"
            onClick={() => navigate('/schedule')}
          >
            <span>{t('schedule.viewFullSchedule')}</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 