// toast.js
import { message } from 'antd';

export const NotifyType = {
  SUCCESS : 'success',
  INFO : 'info',
  WARNING : 'warning',
  ERROR : 'error',
}


const toast = (type, text, duration = 3) => {
  switch (type) {
    case 'success':
      message.success(text, duration);
      break;
    case 'error':
      message.error(text, duration);
      break;
    case 'info':
      message.info(text, duration);
      break;
    case 'warning':
      message.warning(text, duration);
      break;
    default:
      message.open({ content: text, duration });
  }
};

export default toast;
