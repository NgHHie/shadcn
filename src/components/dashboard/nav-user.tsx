// src/components/dashboard/nav-user.tsx
import {
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
  Moon,
  Sun,
  Monitor,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { toastSuccess } from "@/lib/toast";
import { useApi } from "@/lib/api";

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  fullName: string;
  isPremium: boolean;
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const api = useApi();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch user info - simple version
  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      if (hasLoaded) return; // Only fetch once

      try {
        setLoading(true);
        const userData = await api.user.getUserInfo();

        if (mounted) {
          setUserInfo(userData);
          setHasLoaded(true);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        if (mounted) {
          setHasLoaded(true); // Mark as loaded even on error
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [api.user, hasLoaded]);

  const handleAccountClick = useCallback(() => {
    navigate("/profile");
  }, [navigate]);

  const handleThemeChange = useCallback(
    (newTheme: string) => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  const handleLogout = useCallback(async () => {
    try {
      await api.auth.logout();
      toastSuccess("Đăng xuất thành công!", {
        description: "Hẹn gặp lại bạn!",
      });
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      api.utils.clearAuthData();
      toastSuccess("Đăng xuất thành công!");
      setTimeout(() => navigate("/login"), 1000);
    }
  }, [api, navigate]);

  // Helper functions - safe versions
  const getInitials = (user: UserInfo | null): string => {
    if (!user) return "U";

    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.fullName) {
      const parts = user.fullName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return user.fullName[0].toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = (user: UserInfo | null): string => {
    if (!user) return "User";
    return (
      user.fullName ||
      `${user.firstName} ${user.lastName}`.trim() ||
      user.username ||
      "User"
    );
  };

  const getEmail = (user: UserInfo | null): string => {
    return user?.email || "user@example.com";
  };

  // Render logic - simple and safe
  const displayName = getDisplayName(userInfo);
  const initials = getInitials(userInfo);
  const email = getEmail(userInfo);
  const isPremium = userInfo?.isPremium || false;

  // Show loading skeleton
  if (loading && !userInfo) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </div>
            <Loader2 className="ml-auto size-4 animate-spin" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAccountClick}>
                <UserCircleIcon />
                Tài khoản
              </DropdownMenuItem>
              {isPremium && (
                <DropdownMenuItem>
                  <span className="text-yellow-600 font-medium">
                    ✨ Premium Account
                  </span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span>Giao diện</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                  <Sun className="h-4 w-4" />
                  <span>Sáng</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                  <Moon className="h-4 w-4" />
                  <span>Tối</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                  <Monitor className="h-4 w-4" />
                  <span>Hệ thống</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
