"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Sparkles, Clock } from "lucide-react";
import ToolHeader from "./ToolHeader";
import { ToolMeta } from "@/lib/toolsConfig";

interface AiGateProps {
  tool: ToolMeta;
  children: React.ReactNode;
}

type Status = "loading" | "signed-out" | "available" | "used-today";

/**
 * Every AI tool is limited to one use per signed-in account per day (see
 * lib/aiUsage.ts). This gates the tool's UI on that: signed out shows a
 * sign-in prompt, signed in but already used today shows a "come back
 * tomorrow" message, otherwise it renders the real tool.
 */
export default function AiGate({ tool, children }: AiGateProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<Status>("loading");
  const [usedFeature, setUsedFeature] = useState<string | undefined>();

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session) {
      setStatus("signed-out");
      return;
    }
    let cancelled = false;
    fetch("/api/ai-usage/status")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.signedIn) {
          setStatus("signed-out");
        } else if (data.available) {
          setStatus("available");
        } else {
          setUsedFeature(data.usedFeature);
          setStatus("used-today");
        }
      })
      .catch(() => setStatus("available")); // fail open on a status-check hiccup; the API route enforces the real limit
    return () => {
      cancelled = true;
    };
  }, [session, sessionStatus]);

  if (status === "available") return <>{children}</>;

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
                AI tools are limited to one use per day per account, so this one needs a Google sign-in — every other
                tool on this site stays account-free.
              </p>
              <button
                onClick={() => signIn("google")}
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors"
              >
                Sign in with Google
              </button>
            </>
          )}
          {status === "used-today" && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-light text-amber-dark">
                <Clock size={22} />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">You're out of AI actions for today</h3>
              <p className="mt-2 text-sm text-ink-faint">
                Each account gets one AI action per day, and {usedFeature ?? "an AI tool"} already used today's. It
                resets at midnight UTC — every non-AI tool on this site is unaffected and unlimited.
              </p>
            </>
          )}
          {status === "loading" && <div className="h-24" />}
        </div>
      </div>
    </div>
  );
}
