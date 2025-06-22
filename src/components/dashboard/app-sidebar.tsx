// src/components/dashboard/app-sidebar.tsx
import * as React from "react";
import {
  HelpCircleIcon,
  Boxes,
  BookOpen,
  LayoutDashboardIcon,
  FolderIcon,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({
  variant,
  ...props
}: { variant?: string } & React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { t } = useTranslation();

  const data = {
    navMain: [
      {
        title: t("navigation.assignment"),
        url: "/",
        icon: LayoutDashboardIcon,
        isActive: location.pathname === "/",
      },
      {
        title: t("navigation.contest"),
        url: "/contest",
        icon: FolderIcon,
        isActive: location.pathname === "/contest",
      },
      {
        title: t("navigation.quiz"),
        url: "/quiz/quiz-list",
        icon: BookOpen,
        isActive: location.pathname.startsWith("/quiz/"),
        items: [
          {
            title: "Danh sách bài thi",
            url: "/quiz/quiz-list",
          },
          {
            title: "Demo Quiz",
            url: "/quiz/quiz-demo",
          },
        ],
      },
      // {
      //   title: t("navigation.history"),
      //   url: "/history",
      //   icon: ListIcon,
      //   isActive: location.pathname === "/history",
      // },
      // {
      //   title: t("navigation.rank"),
      //   url: "/rank",
      //   icon: BarChartIcon,
      //   isActive: location.pathname === "/rank",
      // },
    ],
    navSecondary: [
      {
        title: t("navigation.feedback"),
        url: "#",
        icon: HelpCircleIcon,
      },
    ],
  };

  return (
    <Sidebar
      collapsible="offcanvas"
      variant={variant}
      {...props}
      className="border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="bg-sidebar border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Link to="/">
                <Boxes className="h-5 w-5 text-sidebar-primary" />
                <span className="text-base font-semibold text-sidebar-foreground">
                  LEARN SQL
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
