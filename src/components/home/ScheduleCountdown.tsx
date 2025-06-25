import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ScheduleCountdownProps {
  startTime: string;
  className?: string;
}

export function ScheduleCountdown({ startTime, className = '' }: ScheduleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      // If the class has already started today, show "Starting now"
      if (now >= startDate) {
        setTimeLeft('Starting now');
        return;
      }

      const diff = startDate.getTime() - now.getTime();
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hoursLeft > 0) {
        setTimeLeft(`In ${hoursLeft}h ${minutesLeft}m`);
      } else if (minutesLeft > 0) {
        setTimeLeft(`In ${minutesLeft}m`);
      } else {
        setTimeLeft('Starting now');
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <Badge variant="outline" className={`text-xs border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/20 ${className}`}>
      <Clock className="h-3 w-3 mr-1" />
      {timeLeft}
    </Badge>
  );
} 