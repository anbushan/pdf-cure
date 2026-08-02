"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

function GoogleMark() {
  return (
    <svg width="15" height="15" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 34.8 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C41.9 35.8 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div className="h-8 w-8" />;

  if (!session) {
    return (
      <button
        onClick={() => signIn("google")}
        className="inline-flex items-center gap-1.5 rounded-md border border-paper-line px-3 py-1.5 text-sm font-medium text-ink-faint hover:text-ink hover:border-ink-faint/40 transition-colors"
      >
        <GoogleMark /> <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {session.user?.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.user.image}
          alt={session.user.name ?? "Account"}
          referrerPolicy="no-referrer"
          className="h-7 w-7 rounded-full"
        />
      ) : (
        <div className="h-7 w-7 rounded-full bg-ink text-paper flex items-center justify-center text-xs font-semibold">
          {(session.user?.name ?? session.user?.email ?? "?").charAt(0).toUpperCase()}
        </div>
      )}
      <button
        onClick={() => signOut()}
        title="Log out"
        aria-label="Log out"
        className="flex items-center justify-center h-8 w-8 rounded-md text-ink-faint hover:text-ink hover:bg-paper-dim transition-colors"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
