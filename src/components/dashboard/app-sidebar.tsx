// src/components/dashboard/app-sidebar.tsx
import * as React from "react";
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  BookOpenIcon,
  Boxes,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";

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

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Assignment",
        url: "/dashboard",
        icon: LayoutDashboardIcon,
        isActive: location.pathname === "/dashboard",
      },
      {
        title: "Editor",
        url: "/editor",
        icon: FileCodeIcon,
        isActive: location.pathname === "/editor",
      },
      {
        title: "History",
        url: "/history",
        icon: ListIcon,
        isActive: false,
      },
      {
        title: "Rank",
        url: "/rank",
        icon: BarChartIcon,
        isActive: false,
      },
      {
        title: "Contest",
        url: "#",
        icon: FolderIcon,
        isActive: false,
      },
      {
        title: "Discuss",
        url: "#",
        icon: UsersIcon,
        isActive: false,
      },
    ],
    navClouds: [
      {
        title: "Capture",
        icon: CameraIcon,
        isActive: true,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Proposal",
        icon: FileTextIcon,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Prompts",
        icon: FileCodeIcon,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "#",
        icon: SettingsIcon,
      },
      {
        title: "Get Help",
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
                  LEARN SQL.
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
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
