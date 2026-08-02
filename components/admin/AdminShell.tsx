"use client";

import { LayoutDashboard, Users, Settings, MessageSquarePlus, CreditCard, Tag, Layers, ScrollText, Bell } from "lucide-react";
import DashboardShell, { type ShellNavItem } from "../DashboardShell";

const NAV: ShellNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User information", icon: Users },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquarePlus },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/pricing", label: "Pricing", icon: Tag },
  { href: "/admin/plans", label: "Plans", icon: Layers },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/audit", label: "Audit logs", icon: ScrollText },
  { href: "/admin/settings", label: "Configuration", icon: Settings },
];

export default function AdminShell({
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
      brandLabel="Admin"
      baseHref="/admin"
      userEmail={userEmail}
      userName={userName}
      logoutMessage="You'll need to sign in again to get back into the admin panel."
    >
      {children}
    </DashboardShell>
  );
}
