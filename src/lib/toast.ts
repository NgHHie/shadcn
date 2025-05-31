// src/lib/toast.ts
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import React from "react";

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
}

// Main toast function
export const showToast = (
  type: ToastType,
  message: string,
  options?: ToastOptions
) => {
  const { title, description, duration = 4000, action, cancel } = options || {};

  const baseConfig: any = {
    description,
    duration,
  };

  // Add action if provided
  if (action) {
    baseConfig.action = {
      label: action.label,
      onClick: (_event: any) => action.onClick(),
    };
  }

  // Add cancel if provided
  if (cancel) {
    baseConfig.cancel = {
      label: cancel.label,
      onClick: cancel.onClick ? (_event: any) => cancel.onClick!() : undefined,
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
        duration: duration || 6000, // Error messages stay longer
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
        duration: Infinity, // Loading toasts don't auto-dismiss
      });

    default:
      return toast(message, baseConfig);
  }
};

// Convenience functions for different toast types
export const toastSuccess = (message: string, options?: ToastOptions) =>
  showToast("success", message, options);

export const toastError = (message: string, options?: ToastOptions) =>
  showToast("error", message, options);

export const toastWarning = (message: string, options?: ToastOptions) =>
  showToast("warning", message, options);

export const toastInfo = (message: string, options?: ToastOptions) =>
  showToast("info", message, options);

export const toastLoading = (message: string, options?: ToastOptions) =>
  showToast("loading", message, options);

// Promise-based toast for async operations
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

// Dismiss specific toast
export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};
