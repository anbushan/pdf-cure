"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "./ToastProvider";
import { trackEvent } from "@/lib/analytics";

/**
 * Fires a toast notification whenever `message` transitions from null/empty
 * to a real value. Designed to be a one-line addition to any tool's
 * existing `const [error, setError] = useState<string | null>(null)` —
 * the inline error text already shown on the page stays as-is; this adds
 * a toast on top so failures are noticeable even if the person has
 * scrolled past the inline message. It also reports a `tool_error` event
 * to Google Analytics (if configured) with the page and message, so
 * failures show up in reporting without touching every tool individually.
 */
export function useErrorToast(message: string | null | undefined) {
  const toast = useToast();
  const pathname = usePathname();
  const lastRef = useRef<string | null | undefined>(null);

  useEffect(() => {
    if (message && message !== lastRef.current) {
      toast.error(message);
      trackEvent("tool_error", { page: pathname, message: message.slice(0, 150) });
    }
    lastRef.current = message;
  }, [message, toast, pathname]);
}
