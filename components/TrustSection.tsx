"use client";

import { Eye, Server, FileKey } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

export default function TrustSection() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 mt-4">
      <div className="rounded-2xl border border-paper-line bg-paper-dim px-8 py-14 text-center sm:px-16">
        <span className="eyebrow text-teal-dark">{t("trustEyebrow")}</span>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {t("trustHeading")}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-faint leading-relaxed">
          {t("trustSubtitle")}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3 px-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-light text-teal-dark">
              <Eye size={22} />
            </span>
            <h3 className="font-display text-base font-semibold text-ink">{t("trustDeviceTitle")}</h3>
            <p className="text-sm text-ink-faint leading-relaxed">{t("trustDeviceBody")}</p>
          </div>

          <div className="flex flex-col items-center gap-3 px-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-light text-amber-dark">
              <Server size={22} />
            </span>
            <h3 className="font-display text-base font-semibold text-ink">{t("trustNoAccountTitle")}</h3>
            <p className="text-sm text-ink-faint leading-relaxed">{t("trustNoAccountBody")}</p>
          </div>

          <div className="flex flex-col items-center gap-3 px-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-light text-violet-dark">
              <FileKey size={22} />
            </span>
            <h3 className="font-display text-base font-semibold text-ink">{t("trustTransparentTitle")}</h3>
            <p className="text-sm text-ink-faint leading-relaxed">{t("trustTransparentBody")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
