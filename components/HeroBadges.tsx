"use client";

import { Zap, Lock, ShieldCheck } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

export default function HeroBadges() {
  const { t } = useLanguage();
  return (
    <div className="mt-8 flex flex-wrap gap-6">
      <div className="flex items-center gap-2 text-sm text-ink-faint">
        <Zap size={16} className="text-amber-dark" /> {t("heroBadgeInstant")}
      </div>
      <div className="flex items-center gap-2 text-sm text-ink-faint">
        <Lock size={16} className="text-rust-dark" /> {t("heroBadgePrivate")}
      </div>
      <div className="flex items-center gap-2 text-sm text-ink-faint">
        <ShieldCheck size={16} className="text-teal-dark" /> {t("heroBadgeFree")}
      </div>
    </div>
  );
}
