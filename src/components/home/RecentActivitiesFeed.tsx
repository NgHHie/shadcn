import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle2, 
  Code2, 
  Trophy, 
  Flame,
  ArrowRight,
  Calendar
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface Activity {
  id: string;
  type: 'quiz' | 'sql' | 'achievement' | 'streak' | 'contest';
  title: string;
  description: string;
  timestamp: Date;
  score?: number;
  status?: 'completed' | 'submitted' | 'unlocked' | 'active';
  color?: string;
}

export function RecentActivitiesFeed() {
  const { t } = useTranslation('home');
  const navigate = useNavigate();

  // Mock activities data
  const activities: Activity[] = [
    {
      id: '1',
      type: 'quiz',
      title: 'JavaScript Fundamentals Quiz',
      description: 'Hoàn thành với điểm số 85/100',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      score: 85,
      status: 'completed',
      color: '#3b82f6'
    },
    {
      id: '2',
      type: 'sql',
      title: 'Complex JOIN Query',
      description: 'Nộp bài SQL exercise - Status: Accepted',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      status: 'submitted',
      color: '#10b981'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'SQL Master Badge',
      description: 'Mở khóa thành tích sau 10 bài SQL hoàn thành',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: 'unlocked',
      color: '#f59e0b'
    },
    {
      id: '4',
      type: 'streak',
      title: 'Study Streak - 7 Days',
      description: 'Chuỗi học tập 7 ngày liên tiếp',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'active',
      color: '#ef4444'
    },
    {
      id: '5',
      type: 'contest',
      title: 'Monthly SQL Contest',
      description: 'Tham gia cuộc thi SQL tháng 6',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: 'submitted',
      color: '#8b5cf6'
    }
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'quiz':
        return CheckCircle2;
      case 'sql':
        return Code2;
      case 'achievement':
        return Trophy;
      case 'streak':
        return Flame;
      case 'contest':
        return Calendar;
      default:
        return Clock;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
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

  const getStatusBadge = (activity: Activity) => {
    switch (activity.status) {
      case 'completed':
        return <Badge variant="default" className="text-xs">Hoàn thành</Badge>;
      case 'submitted':
        return <Badge variant="secondary" className="text-xs">Đã nộp</Badge>;
      case 'unlocked':
        return <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">Mở khóa</Badge>;
      case 'active':
        return <Badge variant="outline" className="text-xs border-red-500 text-red-600">Đang diễn ra</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              {t('recentActivities.title')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('recentActivities.description')}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/history')} className="text-xs h-7">
            {t('recentActivities.viewAll')}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 flex-1 overflow-y-auto">
        {activities.slice(0, 3).map((activity) => {
          const IconComponent = getActivityIcon(activity.type);
          
          return (
            <div 
              key={activity.id}
              className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <div 
                className="p-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: `${activity.color}15` }}
              >
                <IconComponent 
                  className="h-3 w-3" 
                  style={{ color: activity.color }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex-1">
                  <h4 className="font-medium text-xs line-clamp-1 group-hover:text-primary">
                    {activity.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(activity.timestamp)}
                    </span>
                    {getStatusBadge(activity)}
                    {activity.score && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {activity.score}/100
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Empty state or show more button */}
        {activities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có hoạt động nào gần đây</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 