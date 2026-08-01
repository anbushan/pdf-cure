"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function ErrorTracker() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      trackEvent("js_error", {
        message: event.message?.slice(0, 150),
        page: window.location.pathname,
      });
    }
    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const message = typeof reason === "string" ? reason : reason?.message ?? "Unhandled promise rejection";
      trackEvent("js_error", {
        message: String(message).slice(0, 150),
        page: window.location.pathname,
        type: "unhandled_promise",
      });
    }
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
