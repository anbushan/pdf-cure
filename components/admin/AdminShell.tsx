"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, Settings, MessageSquarePlus, CreditCard, Tag, Layers, ScrollText, Bell, LogOut, Menu, X, ExternalLink } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";

const NAV = [
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

function initials(name: string, email: string) {
  const source = name || email;
  return source.charAt(0).toUpperCase();
}

export default function AdminShell({
  children,
  userEmail,
  userName,
}: {
  children: React.ReactNode;
  userEmail: string;
  userName: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  // Close the drawer automatically on route change (e.g. after tapping a nav link).
  useEffect(() => setMobileOpen(false), [pathname]);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-ink text-paper" : "text-ink-faint hover:bg-paper-dim hover:text-ink"
            }`}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  const ProfileCard = () => (
    <div className="flex items-center gap-2.5 rounded-md border border-paper-line bg-paper-dim/60 px-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">
        {initials(userName, userEmail)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight text-ink">{userName || "Admin"}</p>
        <p className="truncate text-xs leading-tight text-ink-faint">{userEmail}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper-dim/40">
      {/* Top bar — always visible, holds the mobile menu toggle + logout */}
      <div className="sticky top-0 z-40 border-b border-paper-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-paper-dim hover:text-ink lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <Link href="/admin" className="font-display text-base font-semibold tracking-tight text-ink">
              PDF<span className="text-rust">Cure</span> <span className="text-ink-faint font-normal">Admin</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 text-sm text-ink-faint hover:text-ink sm:flex"
            >
              View site <ExternalLink size={13} />
            </Link>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-ink leading-tight">{userName || "Admin"}</p>
              <p className="text-xs text-ink-faint leading-tight">{userEmail}</p>
            </div>
            <button
              onClick={() => setConfirmingLogout(true)}
              title="Log out"
              aria-label="Log out"
              className="flex items-center gap-1.5 rounded-md border border-paper-line px-3 py-1.5 text-sm font-medium text-ink-faint hover:text-ink hover:border-ink-faint/40 transition-colors"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer — slide-in panel with backdrop, not an inline push-down list */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <nav className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-1 border-r border-paper-line bg-paper px-3 py-4 shadow-card">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="font-display text-sm font-semibold tracking-tight text-ink">
                PDF<span className="text-rust">Cure</span> <span className="text-ink-faint font-normal">Admin</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-ink-faint hover:bg-paper-dim hover:text-ink"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
            <div className="mt-auto flex flex-col gap-2 pt-3">
              <ProfileCard />
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-ink-faint hover:bg-paper-dim hover:text-ink"
              >
                <ExternalLink size={15} /> View site
              </Link>
            </div>
          </nav>
        </div>
      )}

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 sm:px-6">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col gap-4 lg:flex">
          <nav className="flex flex-col gap-1">
            <NavLinks />
          </nav>
          <ProfileCard />
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <ConfirmDialog
        open={confirmingLogout}
        title="Log out?"
        message="You'll need to sign in again to get back into the admin panel."
        confirmLabel="Log out"
        onConfirm={() => {
          setConfirmingLogout(false);
          signOut({ callbackUrl: "/" });
        }}
        onCancel={() => setConfirmingLogout(false)}
      />
    </div>
  );
}
