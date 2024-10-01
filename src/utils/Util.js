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