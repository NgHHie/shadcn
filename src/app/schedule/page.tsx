import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { scheduleApi, Semester } from '@/lib/api';

interface ScheduleDetail {
  id: string;
  subjectCode: string;
  subjectName: string;
  className: string;
  groupCode: string;
  weekday: number;
  startPeriod: number;
  endPeriod: number;
  room: string;
  classDate: string;
  instructor?: string;
}
interface ScheduleWeek {
  id: string;
  weekNumber: number;
  weekInfo: string;
  startDate: string;
  endDate: string;
  scheduleDetails: ScheduleDetail[];
}
interface ScheduleApiResponse {
  semester: Semester;
  classPeriods: unknown[];
  scheduleWeeks: ScheduleWeek[];
}

export function SchedulePage() {
  const { t } = useTranslation('schedule');
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [scheduleData, setScheduleData] = useState<ScheduleApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);

  // Fetch semesters on mount
  useEffect(() => {
    setLoadingSemesters(true);
    scheduleApi.getSemesters()
      .then((data) => {
        setSemesters(data.semesters);
        if (data.semesters.length > 0) {
          setSelectedSemester(data.semesters[0]);
        }
        setLoadingSemesters(false);
      })
      .catch((err) => {
        console.error('Failed to load semesters:', err);
        setLoadingSemesters(false);
      });
  }, []);

  // Fetch schedule when semester changes
  useEffect(() => {
    if (!selectedSemester) return;
    setLoading(true);
    setError(null);
    scheduleApi.getSchedule(selectedSemester.semesterCode)
      .then((data) => {
        setScheduleData(data as unknown as ScheduleApiResponse);
        setCurrentWeekIndex(0); // default to first week
        setLoading(false);
      })
      .catch((err) => {
        setError(
          typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: unknown }).message === 'string'
            ? (err as { message: string }).message
            : 'Failed to load schedule'
        );
        setLoading(false);
      });
  }, [selectedSemester]);

  const getDays = () => [
    { key: 2, label: t('days.monday') },
    { key: 3, label: t('days.tuesday') },
    { key: 4, label: t('days.wednesday') },
    { key: 5, label: t('days.thursday') },
    { key: 6, label: t('days.friday') },
    { key: 7, label: t('days.saturday') },
    { key: 8, label: t('days.sunday') }
  ];
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

  const currentWeek = scheduleData?.scheduleWeeks?.[currentWeekIndex];
  const classes = currentWeek?.scheduleDetails || [];

  const getClassAtTimeSlot = (dayOfWeek: number, timeSlot: number) => {
    if (!classes) return undefined;
    return classes.find(cls =>
      cls.weekday === dayOfWeek &&
      cls.startPeriod <= timeSlot &&
      timeSlot <= cls.endPeriod
    );
  };
  const isTimeSlotOccupied = (dayOfWeek: number, timeSlot: number) => {
    if (!classes) return false;
    return classes.some(cls =>
      cls.weekday === dayOfWeek &&
      cls.startPeriod <= timeSlot &&
      timeSlot <= cls.endPeriod
    );
  };
  const shouldRenderClass = (dayOfWeek: number, timeSlot: number) => {
    const classAtSlot = getClassAtTimeSlot(dayOfWeek, timeSlot);
    return classAtSlot && classAtSlot.startPeriod === timeSlot;
  };
  const shouldShowBottomBorder = (dayOfWeek: number, timeSlot: number) => {
    const currentClass = getClassAtTimeSlot(dayOfWeek, timeSlot);
    const nextRowClass = getClassAtTimeSlot(dayOfWeek, timeSlot + 1);
    if (!currentClass) return true;
    if (!nextRowClass) return true;
    if (currentClass.id !== nextRowClass.id) return true;
    return false;
  };

  // Week navigation
  const navigateWeek = (direction: 'prev' | 'next') => {
    if (!scheduleData?.scheduleWeeks) return;
    let newIndex = currentWeekIndex + (direction === 'next' ? 1 : -1);
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= scheduleData.scheduleWeeks.length) newIndex = scheduleData.scheduleWeeks.length - 1;
    setCurrentWeekIndex(newIndex);
  };

  const days = getDays();
  const timeSlots = getTimeSlots();

  // Thêm hàm đồng bộ
  const handleSyncSchedule = async () => {
    setLoadingSync(true);
    setError(null);
    try {
      await scheduleApi.syncFromPtit();
      // Sau khi đồng bộ xong, reload lại thời khóa biểu
      if (selectedSemester) {
        setLoading(true);
        const data = await scheduleApi.getSchedule(selectedSemester.semesterCode);
        setScheduleData(data as unknown as ScheduleApiResponse);
        setCurrentWeekIndex(0);
        setLoading(false);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message?: string }).message || 'Đồng bộ thất bại');
      } else {
        setError('Đồng bộ thất bại');
      }
    } finally {
      setLoadingSync(false);
    }
  };

  if (loadingSemesters) return <div className="p-8 text-center">Loading semesters...</div>;
  if (loading) return <div className="p-8 text-center">Loading schedule...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!selectedSemester) return <div className="p-8 text-center">No semester selected.</div>;
  if (!scheduleData?.scheduleWeeks || scheduleData.scheduleWeeks.length === 0) return <div className="p-8 text-center">No schedule data for selected semester.</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('page.title')}</h1>
          <p className="text-muted-foreground">{t('page.description')}</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t('semester.label') || 'Học kỳ:'}</span>
            <Select
              value={selectedSemester?.id || ''}
              onValueChange={(value) => {
                const semester = semesters.find(s => s.id === value);
                if (semester) {
                  setSelectedSemester(semester);
                }
              }}
              disabled={loadingSemesters}
            >
              <SelectTrigger className="w-[320px]">
                <SelectValue placeholder={loadingSemesters ? "Loading..." : "Chọn học kỳ"} />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester.id} value={semester.id}>
                    {semester.semesterName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t('week.title') || 'Tuần:'}</span>
            <Select
              value={currentWeek?.id || ''}
              onValueChange={id => {
                const idx = scheduleData?.scheduleWeeks?.findIndex(w => w.id === id);
                if (idx !== undefined && idx !== -1) setCurrentWeekIndex(idx);
              }}
            >
              <SelectTrigger className="w-[420px] truncate" title={currentWeek?.weekInfo}>
                <SelectValue placeholder={currentWeek?.weekInfo || 'Chọn tuần'} />
              </SelectTrigger>
              <SelectContent>
                {scheduleData?.scheduleWeeks?.map(week => (
                  <SelectItem key={week.id} value={week.id}>{week.weekInfo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSyncSchedule} disabled={loadingSync} className="whitespace-nowrap">
            {loadingSync ? 'Đang đồng bộ...' : 'Đồng bộ TKB QLDT'}
          </Button>
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
                disabled={currentWeekIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <CardTitle className="text-lg">{currentWeek?.weekInfo || t('week.title')}</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
                title={t('navigation.nextWeek')}
                disabled={currentWeekIndex === (((scheduleData?.scheduleWeeks?.length ?? 1) - 1))}
              >
                <ChevronRight className="h-4 w-4" />
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
                const shouldShowRowBorder = days.some(day => shouldShowBottomBorder(day.key, timeSlot.slot));
                return (
                  <div
                    key={timeSlot.slot}
                    className="grid grid-cols-8 min-h-[80px]"
                    style={{ borderBottom: shouldShowRowBorder ? '1px solid hsl(var(--border))' : 'none' }}
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
                          className={`relative min-h-[80px] border-r ${isOccupied && !shouldShow ? 'bg-gradient-to-r from-muted/10 to-muted/5' : ''}`}
                        >
                          <div className="p-2 h-full">
                            {shouldShow && classAtSlot ? (
                              <div
                                className="rounded-lg text-xs cursor-pointer hover:shadow-md transition-all duration-200 absolute left-2 right-2 border border-primary/30 bg-primary/10"
                                style={{
                                  height: `${(classAtSlot.endPeriod - classAtSlot.startPeriod + 1) * 80 - 8}px`,
                                  zIndex: 10,
                                  top: '8px'
                                }}
                              >
                                <div className="w-full h-1 rounded-t-lg bg-primary" />
                                <div className="p-2 pt-1 h-full flex flex-col">
                                  <div className="font-medium line-clamp-2 mb-1 text-primary">
                                    {classAtSlot.subjectName}
                                  </div>
                                  <div className="text-muted-foreground space-y-1 flex-1">
                                    <div className="flex items-center gap-1">
                                      <span className="font-mono text-xs text-primary/80">{classAtSlot.subjectCode}</span>
                                    </div>
                                    <div className="text-xs font-semibold text-primary/80 mb-1">
                                      Nhóm: {classAtSlot.groupCode}
                                    </div>
                                    {classAtSlot.instructor && (
                                      <div className="text-xs text-primary/80 mb-1">
                                        Giảng viên: {classAtSlot.instructor}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3 opacity-40" />
                                      <span className="truncate text-xs">{classAtSlot.room}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : isOccupied && classAtSlot ? (
                              <div className="flex items-center justify-center h-full opacity-30"></div>
                            ) : null}
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