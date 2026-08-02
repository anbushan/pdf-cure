"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Sparkles, Clock, Sparkle } from "lucide-react";
import ToolHeader from "./ToolHeader";
import { ToolMeta } from "@/lib/toolsConfig";

interface AiGateProps {
  tool: ToolMeta;
  children: React.ReactNode;
}

type Status = "loading" | "signed-out" | "available" | "exhausted";

interface UsageData {
  plan: "free" | "pro";
  used: number;
  limit: number;
  usedFeature?: string;
}

/**
 * AI tools are gated on plan (see lib/aiUsage.ts): Free accounts share one
 * action per day across every AI tool; Pro accounts get their own daily
 * pool per tool. Signed out shows a sign-in prompt, an exhausted quota
 * shows a "come back tomorrow" (or upgrade, for free accounts) message,
 * otherwise it renders the real tool with a small usage indicator on top.
 */
export default function AiGate({ tool, children }: AiGateProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<Status>("loading");
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session) {
      setStatus("signed-out");
      return;
    }
    let cancelled = false;
    fetch(`/api/ai-usage/status?feature=${encodeURIComponent(tool.name)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.signedIn) {
          setStatus("signed-out");
          return;
        }
        setUsage({ plan: data.plan, used: data.used, limit: data.limit, usedFeature: data.usedFeature });
        setStatus(data.available ? "available" : "exhausted");
      })
      .catch(() => setStatus("available")); // fail open on a status-check hiccup; the API route enforces the real limit
    return () => {
      cancelled = true;
    };
  }, [session, sessionStatus, tool.name]);

  if (status === "available") {
    return (
      <>
        {usage && (
          <div className="mx-auto max-w-xl px-6 mt-6">
            <div className="flex items-center justify-between gap-3 rounded-md border border-paper-line bg-paper-dim px-3.5 py-2 text-xs text-ink-faint">
              <span className="inline-flex items-center gap-1.5">
                <Sparkle size={13} className="text-violet-dark" />
                {usage.plan === "pro"
                  ? `Pro plan · ${usage.limit - usage.used} of ${usage.limit} uses left today for this tool`
                  : `Free plan · ${usage.limit - usage.used} of ${usage.limit} AI action left today (shared across all AI tools)`}
              </span>
              {usage.plan === "free" && (
                <Link href="/pricing" className="shrink-0 font-medium text-amber-dark hover:underline">
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        <div className="paper-stack p-8 text-center">
          {status === "signed-out" && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-light text-violet-dark">
                <Sparkles size={22} />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">Sign in to use this AI tool</h3>
              <p className="mt-2 text-sm text-ink-faint">
                AI tools need a Google sign-in and are limited to one use per day on the free plan — every other tool
                on this site stays account-free.
              </p>
              <button
                onClick={() => signIn("google")}
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors"
              >
                Sign in with Google
              </button>
            </>
          )}
          {status === "exhausted" && usage && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-light text-amber-dark">
                <Clock size={22} />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">You're out of AI actions for today</h3>
              {usage.plan === "pro" ? (
                <p className="mt-2 text-sm text-ink-faint">
                  You've used all {usage.limit} of today's actions for this tool. It resets at midnight UTC — your
                  other AI tools each have their own separate daily pool.
                </p>
              ) : (
                <p className="mt-2 text-sm text-ink-faint">
                  The free plan includes one AI action per day, shared across every AI tool, and{" "}
                  {usage.usedFeature ?? "an AI tool"} already used today's. It resets at midnight UTC — or upgrade to
                  Pro for a much higher limit per tool.
                </p>
              )}
              {usage.plan === "free" && (
                <Link
                  href="/pricing"
                  className="mt-6 inline-flex items-center gap-2 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors"
                >
                  See Pro plan
                </Link>
              )}
            </>
          )}
          {status === "loading" && <div className="h-24" />}
        </div>
      </div>
    </div>
  );
}
