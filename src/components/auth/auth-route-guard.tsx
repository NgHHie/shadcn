import { useEffect, ReactNode, useRef } from "react";
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
  const lastCheckTime = useRef<number>(0);
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!requireAuth) return;
    if (location.pathname === "/login") return;

    const checkAuthStatus = () => {
      // Tránh check quá thường xuyên
      const now = Date.now();
      if (now - lastCheckTime.current < 5000) return;
      lastCheckTime.current = now;

      // Không redirect nếu đang refresh token
      if (TokenManager.isCurrentlyRefreshing()) {
        console.log("🔄 Token refresh in progress, skipping auth check");
        return true;
      }

      const hasValidTokens = TokenManager.hasValidTokens();

      if (!hasValidTokens) {
        // Clear timeout nếu có
        if (redirectTimeout.current) {
          clearTimeout(redirectTimeout.current);
        }

        // Delay redirect một chút để token refresh có thể hoàn thành
        redirectTimeout.current = setTimeout(() => {
          // Check lại sau delay
          if (
            !TokenManager.hasValidTokens() &&
            !TokenManager.isCurrentlyRefreshing()
          ) {
            TokenManager.clearTokens();

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

            navigate("/login", { replace: true });
          }
        }, 2000); // Delay 2 giây

        return false;
      }

      return true;
    };

    // Initial check với delay
    const initialCheckTimeout = setTimeout(checkAuthStatus, 1000);

    // Periodic check với interval lớn hơn
    const authCheckInterval = setInterval(() => {
      checkAuthStatus();
    }, 60000); // Check mỗi 60 giây thay vì 30 giây

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "refresh_token") {
        if (!e.newValue && !TokenManager.isCurrentlyRefreshing()) {
          // Token bị xóa và không phải do refresh
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
      clearTimeout(initialCheckTimeout);
      clearInterval(authCheckInterval);
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, location.pathname, requireAuth]);

  return <>{children}</>;
};
