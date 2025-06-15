// src/components/auth/auth-route-guard.tsx
import { useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TokenManager } from "@/lib/token-manager";
import { toastError } from "@/lib/toast";

interface AuthRouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const AuthRouteGuard = ({
  children,
  requireAuth = true,
}: AuthRouteGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check auth for protected routes
    if (!requireAuth) return;

    // Skip auth check for login page
    if (location.pathname === "/login") return;

    const checkAuthStatus = () => {
      const hasValidTokens = TokenManager.hasValidTokens();

      if (!hasValidTokens) {
        // Clear any invalid tokens
        TokenManager.clearTokens();

        // Show toast with login button
        toastError("Phiên đăng nhập đã hết hạn", {
          description: "Vui lòng đăng nhập lại để tiếp tục",
          duration: 5000,
          action: {
            label: "Đăng nhập lại",
            onClick: () => {
              navigate("/login", { replace: true });
            },
          },
        });

        // Redirect to login page
        navigate("/login", { replace: true });
        return false;
      }

      return true;
    };

    // Initial check
    checkAuthStatus();

    // Set up interval to check auth status periodically
    const authCheckInterval = setInterval(() => {
      checkAuthStatus();
    }, 30000); // Check every 30 seconds

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "refresh_token") {
        if (!e.newValue) {
          // Token was removed from another tab
          toastError("Đã đăng xuất từ tab khác", {
            description: "Vui lòng đăng nhập lại",
            action: {
              label: "Đăng nhập lại",
              onClick: () => {
                navigate("/login", { replace: true });
              },
            },
          });
          navigate("/login", { replace: true });
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, location.pathname, requireAuth]);

  return <>{children}</>;
};
