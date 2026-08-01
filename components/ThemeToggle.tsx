"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, Theme } from "./ThemeProvider";

const ORDER: Theme[] = ["light", "dark", "system"];
const ICONS = { light: Sun, dark: Moon, system: Monitor };
const LABELS = { light: "Light", dark: "Dark", system: "System" };

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = ICONS[theme];

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(next);
  }

  return (
    <button
      onClick={cycle}
      className="inline-flex items-center gap-1.5 rounded-md border border-paper-line px-2.5 py-1.5 text-xs font-medium text-ink-faint hover:text-ink hover:border-ink-faint/40 transition-colors"
      aria-label={`Theme: ${LABELS[theme]}. Click to change.`}
      title={`Theme: ${LABELS[theme]}`}
    >
      <Icon size={13} />
      <span className="hidden lg:inline">{LABELS[theme]}</span>
    </button>
  );
}
