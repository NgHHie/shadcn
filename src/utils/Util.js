import { format } from 'date-fns';

export function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return format(date, 'HH:mm dd/MM/yyyy');
      } catch (error) {
        console.error('Invalid date format:', dateString);
        return 'Invalid date';
      }
}

export const getUrlPage = (api, page, size) => {
  const hasQueryParams = api.includes('?');
  const separator = hasQueryParams ? '&' : '?';
  const url = `${api}${separator}page=${page - 1 >= 0 ? page - 1 : 0}&size=${size}`;
  return url;
};

export const isValid = (data) => {
  return data !== undefined && data !== null
}

export const formatTimeCountDown = (seconds) => {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const daysDisplay = days > 0 ? `${days} ngày ` : '';
  const hoursDisplay = hours > 0 ? `${hours} giờ ` : '';
  const minutesDisplay = minutes > 0 ? `${minutes} phút ` : '';
  const secondsDisplay = `${remainingSeconds < 10 ? '0' : ''}${remainingSeconds} giây`;

  return `${daysDisplay}${hoursDisplay}${minutesDisplay}${secondsDisplay}`;
};

export const formatCountNumber = (count) => {
  if(!count) return ""
  if (count >= 1_000_000_000) return (count / 1_000_000_000).toFixed(0) + 'B';
  if (count >= 1_000_000) return (count / 1_000_000).toFixed(1) + 'M';
  if (count >= 1_000) return (count / 1_000).toFixed(0) + 'K';
  return count.toString();
};