import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, User, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface TodayClass {
  id: string;
  startTime: string;
  endTime: string;
  subject: string;
  code: string;
  room: string;
  roomFullName: string;
  building: string;
  instructor: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  color: string;
  duration: number; // Số tiết học liên tiếp (1 tiết = 45 phút)
}

interface ScheduleCardProps {
  loading?: boolean;
}

export function ScheduleCard({ loading = false }: ScheduleCardProps) {
  const { t, i18n } = useTranslation('home');
  const navigate = useNavigate();

  // Mock data for today's classes with corrected timing
  const todayClasses: TodayClass[] = [
    {
      id: '1',
      startTime: '08:00',
      endTime: '11:15', // 4 tiết x 45 phút + 15 phút nghỉ
      subject: 'Phát triển phần mềm hướng dịch vụ',
      code: 'INT1448',
      room: '304-NT',
      roomFullName: 'Phòng 304, Tòa nhà Ngọc Trúc, Tầng 3',
      building: 'CS Ngọc Trúc',
      instructor: 'Đặng Ngọc Hùng',
      status: 'upcoming',
      color: '#3b82f6',
      duration: 4
    },
    {
      id: '2',
      startTime: '13:00',
      endTime: '16:15', // 4 tiết x 45 phút + 15 phút nghỉ
      subject: 'Kiến trúc và thiết kế phần mềm',
      code: 'INT1427',
      room: '205-A2',
      roomFullName: 'Phòng 205, Tòa nhà A2, Tầng 2',
      building: 'CS Ngọc Trúc',
      instructor: 'Trần Đình Quế',
      status: 'upcoming',
      color: '#10b981',
      duration: 4
    },
    {
      id: '3',
      startTime: '18:00',
      endTime: '19:30', // 2 tiết x 45 phút
      subject: 'Thực hành SQL nâng cao',
      code: 'INT1429',
      room: 'Lab-1',
      roomFullName: 'Phòng thực hành Lab-1, Tòa nhà B1',
      building: 'CS Ngọc Trúc',
      instructor: 'Nguyễn Văn A',
      status: 'upcoming',
      color: '#f59e0b',
      duration: 2
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <Badge className="bg-green-500 text-white">Đang diễn ra</Badge>;
      case 'upcoming':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Sắp tới</Badge>;
      case 'completed':
        return <Badge variant="secondary">Đã kết thúc</Badge>;
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

  if (loading) {
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

  return (
    <TooltipProvider>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              {t('schedule.title')}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {todayClasses.length} tiết học
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {getCurrentTime()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Timeline visualization */}
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-emerald-200 to-amber-200"></div>
            
            <div className="space-y-3">
              {todayClasses.slice(0, 3).map((classItem) => (
                <div key={classItem.id} className="relative">
                  {/* Timeline dot */}
                  <div 
                    className="absolute left-2 w-2.5 h-2.5 rounded-full border border-white z-10"
                    style={{ backgroundColor: classItem.color }}
                  />
                  
                  <div 
                    className="group ml-6 p-3 rounded-lg border-l-3 bg-card hover:shadow-sm transition-all cursor-pointer"
                    style={{ borderLeftColor: classItem.color }}
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
                        {getStatusBadge(classItem.status)}
                      </div>
                      
                      {/* Subject */}
                      <h4 className="font-semibold text-sm line-clamp-1 mb-1">
                        {classItem.subject}
                      </h4>
                      
                      {/* Details - More compact */}
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
                            {classItem.code}
                          </span>
                          <span className="bg-secondary/50 px-1.5 py-0.5 rounded text-xs">
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
          
          <Button 
            variant="ghost" 
            className="w-full justify-between hover:bg-muted/50 mt-3 h-8 text-xs"
            onClick={() => navigate('/schedule')}
          >
            <span>Xem thời khóa biểu đầy đủ</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 