"use client";

import { LayoutDashboard, Download, History, Bell, Settings } from "lucide-react";
import DashboardShell, { type ShellNavItem } from "../DashboardShell";

const NAV: ShellNavItem[] = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/downloads", label: "My Downloads", icon: Download },
  { href: "/account/activity", label: "Recent Activity", icon: History },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountShell({
  children,
  userEmail,
  userName,
}: {
  children: React.ReactNode;
  userEmail: string;
  userName: string;
}) {
  return (
    <DashboardShell
      navItems={NAV}
      brandLabel="My Account"
      baseHref="/account"
      userEmail={userEmail}
      userName={userName}
      logoutMessage="You'll need to sign in again to get back into your account."
    >
      {children}
    </DashboardShell>
  );
}
