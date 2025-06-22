import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin,
  User} from "lucide-react";
import { useTranslation } from "react-i18next";

interface ScheduleClass {
  id: string;
  subject: string;
  code: string;
  group: string;
  room: string;
  building: string;
  instructor: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number; // 2=Thứ 2, 3=Thứ 3, etc.
  startTimeSlot: number; // Tiết bắt đầu (1-15)
  duration: number; // Số tiết liên tiếp (1, 2, hoặc 3)
  color: string;
  type: 'lecture' | 'lab' | 'practice';
}

interface WeekSchedule {
  weekStart: Date;
  classes: ScheduleClass[];
}

export function SchedulePage() {
  const { t, i18n } = useTranslation('schedule');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Mock data for week schedule
  const weekSchedule: WeekSchedule = {
    weekStart: currentWeek,
    classes: [
      {
        id: '1',
        subject: 'Phát triển phần mềm hướng dịch vụ',
        code: 'INT1448',
        group: '01',
        room: '304-NT-304',
        building: 'CS Ngọc Trúc',
        instructor: 'Đặng Ngọc Hùng',
        startTime: '08:00',
        endTime: '10:00',
        dayOfWeek: 4, // Thứ 4
        startTimeSlot: 2, // Bắt đầu tiết 2 (8h)
        duration: 3, // Kéo dài 3 tiết (8h-11h)
        color: '#3b82f6',
        type: 'lecture'
      },
      {
        id: '2',
        subject: 'Kiến trúc và thiết kế phần mềm',
        code: 'INT1427',
        group: '04',
        room: '304-NT-304',
        building: 'CS Ngọc Trúc', 
        instructor: 'Trần Đình Quế',
        startTime: '13:00',
        endTime: '15:00',
        dayOfWeek: 4, // Thứ 4
        startTimeSlot: 7, // Bắt đầu tiết 7 (13h)
        duration: 3, // Kéo dài 3 tiết (13h-16h)
        color: '#3b82f6',
        type: 'lecture'
      },
      {
        id: '3',
        subject: 'Đảm bảo chất lượng phần mềm',
        code: 'INT1416',
        group: '02',
        room: '304-NT-304',
        building: 'CS Ngọc Trúc',
        instructor: 'Đào Ngọc Phong',
        startTime: '13:00',
        endTime: '15:00',
        dayOfWeek: 3, // Thứ 3
        startTimeSlot: 7, // Bắt đầu tiết 7 (13h)
        duration: 3, // Kéo dài 3 tiết
        color: '#3b82f6',
        type: 'lecture'
      },
      {
        id: '4',
        subject: 'Xây dựng các hệ thống thông minh',
        code: 'INT1461',
        group: '02',
        room: '302-NT-302',
        building: 'CS Ngọc Trúc',
        instructor: 'Chu Văn Cường',
        startTime: '10:00',
        endTime: '11:00',
        dayOfWeek: 2, // Thứ 2
        startTimeSlot: 4, // Bắt đầu tiết 4 (10h)
        duration: 2, // Kéo dài 2 tiết (10h-12h)
        color: '#3b82f6',
        type: 'lab'
      },
      {
        id: '5',
        subject: 'Phát triển ứng dụng cho các thiết bị di động',
        code: 'INT1449',
        group: '01',
        room: '304-NT-304',
        building: 'CS Ngọc Trúc',
        instructor: 'Nguyễn Hoàng Anh',
        startTime: '08:00',
        endTime: '09:00',
        dayOfWeek: 3, // Thứ 3
        startTimeSlot: 2, // Bắt đầu tiết 2 (8h)
        duration: 2, // Kéo dài 2 tiết (8h-10h)
        color: '#3b82f6',
        type: 'lecture'
      }
    ]
  };

  // Dynamic days with translation
  const getDays = () => [
    { key: 2, label: t('days.monday') },
    { key: 3, label: t('days.tuesday') },
    { key: 4, label: t('days.wednesday') },
    { key: 5, label: t('days.thursday') },
    { key: 6, label: t('days.friday') },
    { key: 7, label: t('days.saturday') },
    { key: 8, label: t('days.sunday') }
  ];

  // Dynamic time slots with translation
  const getTimeSlots = () => [
    { slot: 1, time: '07:00', label: t('timeSlots.slot1') },
    { slot: 2, time: '08:00', label: t('timeSlots.slot2') },
    { slot: 3, time: '09:00', label: t('timeSlots.slot3') },
    { slot: 4, time: '10:00', label: t('timeSlots.slot4') },
    { slot: 5, time: '11:00', label: t('timeSlots.slot5') },
    { slot: 6, time: '12:00', label: t('timeSlots.slot6') },
    { slot: 7, time: '13:00', label: t('timeSlots.slot7') },
    { slot: 8, time: '14:00', label: t('timeSlots.slot8') },
    { slot: 9, time: '15:00', label: t('timeSlots.slot9') },
    { slot: 10, time: '16:00', label: t('timeSlots.slot10') },
    { slot: 11, time: '17:00', label: t('timeSlots.slot11') },
    { slot: 12, time: '18:00', label: t('timeSlots.slot12') },
    { slot: 13, time: '19:00', label: t('timeSlots.slot13') },
    { slot: 14, time: '20:00', label: t('timeSlots.slot14') },
    { slot: 15, time: '21:00', label: t('timeSlots.slot15') }
  ];

  const getClassAtTimeSlot = (dayOfWeek: number, timeSlot: number) => {
    return weekSchedule.classes.find(cls => 
      cls.dayOfWeek === dayOfWeek && 
      cls.startTimeSlot <= timeSlot &&
      timeSlot < cls.startTimeSlot + cls.duration
    );
  };

  const isTimeSlotOccupied = (dayOfWeek: number, timeSlot: number) => {
    return weekSchedule.classes.some(cls => 
      cls.dayOfWeek === dayOfWeek && 
      cls.startTimeSlot <= timeSlot &&
      timeSlot < cls.startTimeSlot + cls.duration
    );
  };

  const shouldRenderClass = (dayOfWeek: number, timeSlot: number) => {
    const classAtSlot = getClassAtTimeSlot(dayOfWeek, timeSlot);
    return classAtSlot && classAtSlot.startTimeSlot === timeSlot;
  };

  const shouldShowBottomBorder = (dayOfWeek: number, timeSlot: number) => {
    const currentClass = getClassAtTimeSlot(dayOfWeek, timeSlot);
    const nextRowClass = getClassAtTimeSlot(dayOfWeek, timeSlot + 1);
    
    // Nếu không có class hiện tại, hiển thị border
    if (!currentClass) return true;
    
    // Nếu không có class ở row tiếp theo, hiển thị border  
    if (!nextRowClass) return true;
    
    // Nếu class hiện tại và class ở row tiếp theo khác nhau, hiển thị border
    if (currentClass.id !== nextRowClass.id) return true;
    
    // Nếu cùng class, ẩn border để tạo cảm giác liền mạch
    return false;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const formatWeekRange = () => {
    const weekStart = new Date(currentWeek);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const isVietnamese = i18n.language === 'vi';
    
    return isVietnamese 
      ? `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}/${weekEnd.getFullYear()}`
      : `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}/${weekEnd.getFullYear()}`;
  };

  const days = getDays();
  const timeSlots = getTimeSlots();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('page.title')}</h1>
          <p className="text-muted-foreground">{t('page.description')}</p>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
                title={t('navigation.previousWeek')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <CardTitle className="text-lg">{t('week.title')} {formatWeekRange()}</CardTitle>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
                title={t('navigation.nextWeek')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                {t('viewMode.week')}
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                {t('viewMode.month')}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Schedule Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 bg-muted/50 font-medium text-sm">{t('timeSlots.time')}</div>
                {days.map(day => (
                  <div key={day.key} className="p-3 bg-muted/50 font-medium text-sm text-center">
                    {day.label}
                  </div>
                ))}
              </div>
              
              {/* Time Slots */}
              {timeSlots.map(timeSlot => {
                // Check if this row should have bottom border
                const shouldShowRowBorder = days.some(day => {
                  return shouldShowBottomBorder(day.key, timeSlot.slot);
                });
                
                return (
                <div 
                  key={timeSlot.slot} 
                  className="grid grid-cols-8 min-h-[80px]"
                  style={{
                    borderBottom: shouldShowRowBorder ? '1px solid hsl(var(--border))' : 'none'
                  }}
                >
                  {/* Time Column */}
                  <div className="p-3 bg-muted/20 border-r">
                    <div className="text-sm font-medium">{timeSlot.label}</div>
                    <div className="text-xs text-muted-foreground">{timeSlot.time}</div>
                  </div>
                  
                  {/* Day Columns */}
                  {days.map(day => {
                    const classAtSlot = getClassAtTimeSlot(day.key, timeSlot.slot);
                    const shouldShow = shouldRenderClass(day.key, timeSlot.slot);
                    const isOccupied = isTimeSlotOccupied(day.key, timeSlot.slot);

                    
                    return (
                      <div 
                        key={`${day.key}-${timeSlot.slot}`} 
                        className={`relative min-h-[80px] border-r ${
                          isOccupied && !shouldShow 
                            ? 'bg-gradient-to-r from-muted/10 to-muted/5' 
                            : ''
                        }`}
                      >
                        {/* Always preserve cell structure for borders */}
                        <div className="p-2 h-full">
                          {shouldShow && classAtSlot ? (
                            // Render full class content only at starting slot
                            <div 
                              className="rounded-lg text-xs cursor-pointer hover:shadow-md transition-all duration-200 absolute left-2 right-2 border border-blue-200 dark:border-blue-800/30"
                              style={{ 
                                backgroundColor: '#3b82f615', // Blue background with opacity
                                height: `${classAtSlot.duration * 80 - 8}px`, // Span multiple rows
                                zIndex: 10,
                                top: '8px'
                              }}
                            >
                              {/* Subtle top accent bar */}
                              <div 
                                className="w-full h-1 rounded-t-lg" 
                                style={{ backgroundColor: '#3b82f6' }}
                              />
                              
                              <div className="p-2 pt-1 h-full flex flex-col">
                                <div className="font-medium line-clamp-2 mb-1 text-foreground">
                                  {classAtSlot.subject}
                                </div>
                                <div className="text-muted-foreground space-y-1 flex-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono text-xs">{classAtSlot.code}</span>
                                    <Badge variant="outline" className="text-xs px-1 py-0 ml-1">
                                      {classAtSlot.group}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 opacity-40" />
                                    <span className="truncate text-xs">{classAtSlot.room}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3 opacity-40" />
                                    <span className="truncate text-xs">{classAtSlot.instructor}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded px-1.5 py-0.5 mt-1 inline-block text-xs font-medium">
                                      {classAtSlot.duration} {t('class.periods')} • {classAtSlot.startTime}-{classAtSlot.endTime}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : isOccupied && classAtSlot ? (
                            // Render continuation indicator for occupied but non-starting slots
                            <div className="flex items-center justify-center h-full opacity-30">
                            </div>
                          ) : (
                            // Empty cell
                            null
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 