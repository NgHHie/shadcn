// src/hooks/use-auth-guard.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TokenManager } from "@/lib/token-manager";
import { toastError } from "@/lib/toast";

export const useAuthGuard = () => {
  const navigate = useNavigate();

  const checkAuth = () => {
    const hasTokens = TokenManager.hasValidTokens();

    if (!hasTokens) {
      toastError("Phiên đăng nhập đã hết hạn", {
        description: "Vui lòng đăng nhập lại để tiếp tục",
        action: {
          label: "Đăng nhập lại",
          onClick: () => {
            navigate("/login");
          },
        },
      });

      // Clear any remaining invalid tokens
      TokenManager.clearTokens();
      navigate("/login");
      return false;
    }

    return true;
  };

  const redirectToLogin = (message?: string) => {
    TokenManager.clearTokens();

    toastError(message || "Phiên đăng nhập đã hết hạn", {
      description: "Vui lòng đăng nhập lại để tiếp tục",
      action: {
        label: "Đăng nhập lại",
        onClick: () => {
          navigate("/login");
        },
      },
    });

    navigate("/login");
  };

  // Check auth on mount and periodically
  useEffect(() => {
    checkAuth();

    const interval = setInterval(() => {
      checkAuth();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    checkAuth,
    redirectToLogin,
  };
};
