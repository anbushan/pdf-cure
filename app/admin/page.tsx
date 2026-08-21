"use client";

import { useEffect, useState } from "react";
import { Users, Sparkle, IndianRupee, Bot, Loader2 } from "lucide-react";
import MiniBarChart from "@/components/admin/MiniBarChart";

interface DashboardData {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  adminCount: number;
  totalRevenue: number;
  totalAiUsage: number;
  todayAiUsage: number;
  signups: { day: string; count: number }[];
  revenue: { day: string; amount: number }[];
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent: string }) {
  return (
    <div className="paper-stack p-4">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-sm ${accent}`}>
          <Icon size={16} />
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-faint">
        <Loader2 size={20} className="animate-spin" />
      </div>
    );
  }

  const recentSignups = data.signups.reduce((sum, d) => sum + d.count, 0);
  const recentRevenue = data.revenue.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-faint">An overview of accounts, revenue, and AI tool usage.</p>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={String(data.totalUsers)} accent="bg-teal-light text-teal-dark" />
        <StatCard icon={Sparkle} label="Pro subscribers" value={String(data.proUsers)} accent="bg-amber-light text-amber-dark" />
        <StatCard
          icon={IndianRupee}
          label="Total revenue"
          value={data.totalRevenue.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
          accent="bg-violet-light text-violet-dark"
        />
        <StatCard icon={Bot} label="AI actions today" value={String(data.todayAiUsage)} accent="bg-rust-light text-rust-dark" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="paper-stack p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-ink">New signups — last 30 days</h2>
            <span className="text-xs text-ink-faint">{recentSignups} total</span>
          </div>
          <div className="mt-4">
            <MiniBarChart data={data.signups.map((d) => ({ day: d.day, value: d.count }))} color="#0B9498" />
          </div>
        </div>

        <div className="paper-stack p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-ink">Revenue — last 30 days</h2>
            <span className="text-xs text-ink-faint">
              {recentRevenue.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="mt-4">
            <MiniBarChart
              data={data.revenue.map((d) => ({ day: d.day, value: d.amount }))}
              color="#0048D9"
              formatValue={(v) => `₹${v.toLocaleString("en-IN")}`}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="paper-stack p-5">
          <h2 className="font-display text-sm font-semibold text-ink">Plan breakdown</h2>
          <div className="mt-4 space-y-2">
            {[
              { label: "Free", count: data.freeUsers, color: "bg-paper-line" },
              { label: "Pro", count: data.proUsers, color: "bg-amber" },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink">{row.label}</span>
                  <span className="text-ink-faint">{row.count}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-paper-dim">
                  <div
                    className={`h-full ${row.color}`}
                    style={{ width: `${data.totalUsers ? (row.count / data.totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="paper-stack p-5">
          <h2 className="font-display text-sm font-semibold text-ink">At a glance</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-faint">Admins</dt>
              <dd className="font-medium text-ink">{data.adminCount}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-faint">AI actions, all time</dt>
              <dd className="font-medium text-ink">{data.totalAiUsage}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-faint">Pro conversion rate</dt>
              <dd className="font-medium text-ink">
                {data.totalUsers ? ((data.proUsers / data.totalUsers) * 100).toFixed(1) : "0.0"}%
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
