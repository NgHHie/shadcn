import { useState, useEffect, useCallback } from 'react';
import { scheduleApi, ScheduleClass } from '@/lib/api';
import { toastError } from '@/lib/toast';

export interface TodayClass {
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
  duration: number;
  type: 'lecture' | 'lab' | 'practice';
}

export function useSchedule() {
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert API ScheduleClass to TodayClass format
  const convertToTodayClass = useCallback((apiClass: ScheduleClass): TodayClass => {
    const now = new Date();
    
    // Calculate status based on current time
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTimeMinutes = parseInt(apiClass.startTime.split(':')[0]) * 60 + parseInt(apiClass.startTime.split(':')[1]);
    const endTimeMinutes = parseInt(apiClass.endTime.split(':')[0]) * 60 + parseInt(apiClass.endTime.split(':')[1]);
    
    let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
    if (currentTime >= startTimeMinutes && currentTime < endTimeMinutes) {
      status = 'ongoing';
    } else if (currentTime >= endTimeMinutes) {
      status = 'completed';
    }

    return {
      id: apiClass.id,
      startTime: apiClass.startTime,
      endTime: apiClass.endTime,
      subject: apiClass.subject,
      code: apiClass.code,
      room: apiClass.room,
      roomFullName: `${apiClass.room}, ${apiClass.building}`,
      building: apiClass.building,
      instructor: apiClass.instructor,
      status,
      color: apiClass.color || '#3b82f6', // Default blue if no color
      duration: apiClass.duration,
      type: apiClass.type
    };
  }, []);

  // Update status based on current time
  const updateClassStatuses = useCallback(() => {
    setTodayClasses(prevClasses => 
      prevClasses.map(classItem => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const startTimeMinutes = parseInt(classItem.startTime.split(':')[0]) * 60 + parseInt(classItem.startTime.split(':')[1]);
        const endTimeMinutes = parseInt(classItem.endTime.split(':')[0]) * 60 + parseInt(classItem.endTime.split(':')[1]);
        
        let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
        if (currentTime >= startTimeMinutes && currentTime < endTimeMinutes) {
          status = 'ongoing';
        } else if (currentTime >= endTimeMinutes) {
          status = 'completed';
        }

        return {
          ...classItem,
          status
        };
      })
    );
  }, []);

  // Filter classes for today
  const filterTodayClasses = (classes: ScheduleClass[] = []): ScheduleClass[] => {
    const today = new Date().getDay();
    // Convert Sunday (0) to 7 to match API format if needed
    const dayOfWeek = today === 0 ? 7 : today;
    
    return Array.isArray(classes) ? classes.filter(cls => cls.dayOfWeek === dayOfWeek) : [];
  };

  // Sort classes by start time
  const sortClassesByTime = (classes: TodayClass[]): TodayClass[] => {
    return classes.sort((a, b) => {
      const timeA = parseInt(a.startTime.replace(':', ''));
      const timeB = parseInt(b.startTime.replace(':', ''));
      return timeA - timeB;
    });
  };

  const fetchTodaySchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await scheduleApi.getSchedule();
      console.log('Schedule API response:', response);
      const classesArr = Array.isArray(response?.classes) ? response.classes : [];
      const todayClassesData = filterTodayClasses(classesArr);
      const convertedClasses = todayClassesData.map(convertToTodayClass);
      const sortedClasses = sortClassesByTime(convertedClasses);
      
      setTodayClasses(sortedClasses);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
      toastError('Không thể tải thời khóa biểu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySchedule();
  }, [convertToTodayClass]);

  // Auto-update status every minute
  useEffect(() => {
    const interval = setInterval(updateClassStatuses, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [updateClassStatuses]);

  const refetch = () => {
    fetchTodaySchedule();
  };

  return {
    todayClasses,
    loading,
    error,
    refetch
  };
} 