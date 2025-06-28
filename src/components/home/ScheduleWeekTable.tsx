import { useMemo } from 'react';
import { ScheduleClass } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { User, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ScheduleWeekTableProps {
  classes: ScheduleClass[];
}

const daysOfWeek = [
  { key: 1, label: 'T2' },
  { key: 2, label: 'T3' },
  { key: 3, label: 'T4' },
  { key: 4, label: 'T5' },
  { key: 5, label: 'T6' },
  { key: 6, label: 'T7' },
  { key: 7, label: 'CN' },
];

function getStatus(classItem: ScheduleClass) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const startTimeMinutes = parseInt(classItem.startTime.split(':')[0]) * 60 + parseInt(classItem.startTime.split(':')[1]);
  const endTimeMinutes = parseInt(classItem.endTime.split(':')[0]) * 60 + parseInt(classItem.endTime.split(':')[1]);
  if (now.getDay() === classItem.dayOfWeek || (now.getDay() === 0 && classItem.dayOfWeek === 7)) {
    if (currentTime >= startTimeMinutes && currentTime < endTimeMinutes) return 'ongoing';
    if (currentTime >= endTimeMinutes) return 'completed';
  }
  return 'upcoming';
}

export function ScheduleWeekTable({ classes }: ScheduleWeekTableProps) {
  const { t } = useTranslation('home');
  // Group classes by dayOfWeek
  const grouped = useMemo(() => {
    const result: Record<number, ScheduleClass[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
    classes.forEach(cls => {
      if (result[cls.dayOfWeek]) result[cls.dayOfWeek].push(cls);
    });
    // Sort each day by startTime
    Object.values(result).forEach(arr => arr.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return result;
  }, [classes]);

  const today = new Date().getDay() === 0 ? 7 : new Date().getDay();

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

  return (
    <TooltipProvider>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full border-collapse text-xs md:text-sm">
          <thead>
            <tr>
              {daysOfWeek.map(day => (
                <th
                  key={day.key}
                  className={`px-3 py-2 font-semibold text-center border-b ${day.key === today ? 'bg-primary/10 text-primary' : 'bg-muted'}`}
                  style={{ fontSize: '1rem', minWidth: 110 }}
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {daysOfWeek.map(day => (
                <td
                  key={day.key}
                  className={`align-top p-2 min-w-[140px] border-r last:border-r-0 ${day.key === today ? 'bg-primary/5' : ''}`}
                >
                  {grouped[day.key].length === 0 ? (
                    <span className="text-muted-foreground block text-center">-</span>
                  ) : (
                    <div className="space-y-3">
                      {grouped[day.key].map(cls => {
                        const status = getStatus(cls);
                        return (
                          <div
                            key={cls.id}
                            className="rounded-lg border p-3 bg-card shadow-sm min-h-[72px] flex flex-col justify-between"
                            style={{ minHeight: 72 }}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-semibold truncate text-sm md:text-base">
                                {cls.subject}
                              </span>
                              {getStatusBadge(status)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <span>{cls.code}</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help underline decoration-dotted flex items-center gap-1">
                                    <MapPin className="inline h-3 w-3 mr-0.5" />{cls.room}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">{cls.room}, {cls.building}</p>
                                </TooltipContent>
                              </Tooltip>
                              <span>• Nhóm {cls.group.padStart(2, '0')}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
                              <User className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{cls.instructor}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
} 