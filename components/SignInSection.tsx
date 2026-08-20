"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Sparkles, Gauge, ShieldCheck } from "lucide-react";
import SignInButton from "./SignInButton";

export default function SignInSection() {
  const { data: session, status } = useSession();

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-2xl border border-paper-line bg-paper-dim px-8 py-14 text-center sm:px-16">
        <span className="eyebrow text-violet-dark">Free Google sign-in</span>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Unlock the AI tools with one tap
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-faint leading-relaxed">
          Every editing tool on this site already works with zero account. Signing in with Google only unlocks the
          AI-powered tools — Summarize, Ask your PDF, Translate, and the AI conversion tools — and lets you manage
          your plan.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3 px-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-light text-violet-dark">
              <Sparkles size={22} />
            </span>
            <h3 className="font-display text-base font-semibold text-ink">AI-powered tools</h3>
            <p className="text-sm text-ink-faint leading-relaxed">
              Summarize, chat with, and translate your PDFs — one free AI action a day, shared across every AI tool.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 px-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-light text-amber-dark">
              <Gauge size={22} />
            </span>
            <h3 className="font-display text-base font-semibold text-ink">Free for everyone</h3>
            <p className="text-sm text-ink-faint leading-relaxed">
              There's no paid plan right now — every tool, including the AI ones once they're back, is free to use.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 px-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-light text-teal-dark">
              <ShieldCheck size={22} />
            </span>
            <h3 className="font-display text-base font-semibold text-ink">Nothing else changes</h3>
            <p className="text-sm text-ink-faint leading-relaxed">
              Merge, compress, sign, and every other tool here keep working with no account, no watermark, forever.
            </p>
          </div>
        </div>

        <div className="mt-10">
          {status === "authenticated" && session ? (
            <div className="inline-flex flex-col items-center gap-2">
              <p className="text-sm text-ink-faint">
                Signed in as <span className="font-medium text-ink">{session.user.email}</span>
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-md bg-amber px-6 py-3 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors"
              >
                View your plan
              </Link>
            </div>
          ) : (
            <SignInButton className="inline-flex items-center gap-2 rounded-md bg-amber px-6 py-3 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors">
              Sign in with Google
            </SignInButton>
          )}
        </div>
      </div>
    </section>
  );
}
