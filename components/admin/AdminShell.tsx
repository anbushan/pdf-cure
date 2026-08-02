"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Users, Settings, MessageSquarePlus, CreditCard, Tag, LogOut, Menu, X, ExternalLink } from "lucide-react";

const NAV = [
  { href: "/admin", label: "User information", icon: Users },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquarePlus },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/pricing", label: "Pricing", icon: Tag },
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
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Log out"
              aria-label="Log out"
              className="flex items-center gap-1.5 rounded-md border border-paper-line px-3 py-1.5 text-sm font-medium text-ink-faint hover:text-ink hover:border-ink-faint/40 transition-colors"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <nav className="border-t border-paper-line bg-paper px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>
          </nav>
        )}
      </div>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 sm:px-6">
        {/* Desktop sidebar */}
        <nav className="hidden w-52 shrink-0 flex-col gap-1 lg:flex">
          <NavLinks />
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
