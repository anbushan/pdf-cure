import Link from "next/link";
import { Sparkles, Clock, Sparkle } from "lucide-react";
import ToolHeader from "./ToolHeader";
import SignInButton from "./SignInButton";
import { ToolMeta } from "@/lib/toolsConfig";
import { getSession } from "@/lib/getSession";
import { getAiUsageStatus } from "@/lib/aiUsage";

interface AiGateProps {
  tool: ToolMeta;
  children: React.ReactNode;
}

/**
 * Every AI tool is gated on plan (see lib/aiUsage.ts): Free accounts share
 * one action per day across every AI tool; Pro accounts get their own
 * daily pool per tool. This is a Server Component specifically so the
 * signed-out/exhausted/available state renders in the initial HTML with no
 * client-side session fetch — that fetch used to be the page's Largest
 * Contentful Paint bottleneck (Lighthouse measured ~4s of pure render
 * delay waiting on it). Only the actual "Sign in" click needs JS
 * (SignInButton), everything else here is static per-request markup.
 */
export default async function AiGate({ tool, children }: AiGateProps) {
  const session = await getSession();

  if (!session?.user) {
    return (
      <div className="pb-24">
        <ToolHeader tool={tool} />
        <div className="mx-auto max-w-xl px-6 mt-8">
          <div className="paper-stack p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-light text-violet-dark">
              <Sparkles size={22} />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">Sign in to use this AI tool</h3>
            <p className="mt-2 text-sm text-ink-faint">
              AI tools need a Google sign-in and are limited to one use per day on the free plan — every other tool
              on this site stays account-free.
            </p>
            <SignInButton className="mt-6 inline-flex items-center gap-2 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors">
              Sign in with Google
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  const usage = await getAiUsageStatus(session.user.id, tool.name);

  if (!usage.available) {
    return (
      <div className="pb-24">
        <ToolHeader tool={tool} />
        <div className="mx-auto max-w-xl px-6 mt-8">
          <div className="paper-stack p-8 text-center">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
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
      {children}
    </>
  );
}
