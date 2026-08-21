"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<any>(null);

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setPromptEvent(e);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!promptEvent) return null;

  return (
    <button
      onClick={async () => {
        promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        trackEvent("pwa_install_prompt_result", { outcome: choice?.outcome ?? "unknown" });
        setPromptEvent(null);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-paper-line px-3 py-1.5 text-xs font-medium text-ink-faint hover:text-ink hover:border-ink-faint/40 transition-colors"
    >
      <Download size={13} /> Install app
    </button>
  );
}
