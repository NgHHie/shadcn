// src/lib/toast.ts
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import React from "react";

// Reduced default durations to minimize setTimeout handlers
const DEFAULT_DURATION = 2000; // Reduced from 4000
const ERROR_DURATION = 3000; // Reduced from 6000

// Debounce function to prevent spam toasts
const debounceMap = new Map();

const debounceToast = (key: string, fn: () => void, delay = 500) => {
  if (debounceMap.has(key)) {
    clearTimeout(debounceMap.get(key));
  }

  const timeoutId = setTimeout(() => {
    fn();
    debounceMap.delete(key);
  }, delay);

  debounceMap.set(key, timeoutId);
};

// Toast types
type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
  debounce?: boolean;
}

// Simplified main toast function
export const showToast = (
  type: ToastType,
  message: string,
  options?: ToastOptions
) => {
  const {
    description,
    duration,
    action,
    cancel,
    debounce: shouldDebounce = false,
  } = options || {};

  const toastFn = () => {
    const baseConfig: any = {
      description,
      duration:
        duration || (type === "error" ? ERROR_DURATION : DEFAULT_DURATION),
    };

    // Simplified action handling
    if (action) {
      baseConfig.action = {
        label: action.label,
        onClick: action.onClick,
      };
    }

    if (cancel) {
      baseConfig.cancel = {
        label: cancel.label,
        onClick: cancel.onClick,
      };
    }

    switch (type) {
      case "success":
        return toast.success(message, {
          ...baseConfig,
          icon: React.createElement(CheckCircle, { className: "h-4 w-4" }),
        });

      case "error":
        return toast.error(message, {
          ...baseConfig,
          icon: React.createElement(XCircle, { className: "h-4 w-4" }),
        });

      case "warning":
        return toast.warning(message, {
          ...baseConfig,
          icon: React.createElement(AlertCircle, { className: "h-4 w-4" }),
        });

      case "info":
        return toast.info(message, {
          ...baseConfig,
          icon: React.createElement(Info, { className: "h-4 w-4" }),
        });

      case "loading":
        return toast.loading(message, {
          ...baseConfig,
          icon: React.createElement(Loader2, {
            className: "h-4 w-4 animate-spin",
          }),
          duration: Infinity,
        });

      default:
        return toast(message, baseConfig);
    }
  };

  if (shouldDebounce) {
    debounceToast(`${type}-${message}`, toastFn);
  } else {
    return toastFn();
  }
};

// Simplified convenience functions
export const toastSuccess = (message: string, options?: ToastOptions) =>
  showToast("success", message, { ...options, debounce: true });

export const toastError = (message: string, options?: ToastOptions) =>
  showToast("error", message, { ...options, debounce: true });

export const toastWarning = (message: string, options?: ToastOptions) =>
  showToast("warning", message, { ...options, debounce: true });

export const toastInfo = (message: string, options?: ToastOptions) =>
  showToast("info", message, { ...options, debounce: true });

export const toastLoading = (message: string, options?: ToastOptions) =>
  showToast("loading", message, options);

// Simplified promise toast
export const toastPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
};

// Dismiss functions
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

export const dismissAllToasts = () => {
  toast.dismiss();
};
