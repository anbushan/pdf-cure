"use client";

import { useEffect, useRef, useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import ResultPanel from "@/components/ResultPanel";
import { buildPdfFromImages } from "@/lib/pdfTools";
import { downloadPdf } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";
import { Smartphone, RefreshCw, FileImage } from "lucide-react";

const tool = getTool("scan-to-pdf")!;
const POLL_MS = 1500;

type Phase = "loading" | "ready" | "expired" | "assembling" | "done" | "error";

function dataUrlToFile(dataUrl: string, name: string): File {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: "image/jpeg" });
}

export default function ScanToPdfPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"waiting" | "connected" | "completed">("waiting");
  const [imageCount, setImageCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startSession() {
    setPhase("loading");
    setError(null);
    setStatus("waiting");
    setImageCount(0);
    try {
      const res = await fetch("/api/scan-session", { method: "POST" });
      const data = await res.json();
      const scanUrl = `${window.location.origin}/scan/${data.id}`;
      const QRCode = (await import("qrcode")).default;
      const qr = await QRCode.toDataURL(scanUrl, { width: 260, margin: 1, color: { dark: "#1a1a1a", light: "#ffffff" } });
      setSessionId(data.id);
      setQrDataUrl(qr);
      setPhase("ready");
    } catch {
      setError("Couldn't start a scan session. Check your connection and try again.");
      setPhase("error");
    }
  }

  useEffect(() => {
    startSession();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "ready" || !sessionId) return;

    async function poll() {
      try {
        const res = await fetch(`/api/scan-session/${sessionId}/status`);
        const data = await res.json();
        if (data.status === "expired") {
          setPhase("expired");
          return;
        }
        setStatus(data.status);
        setImageCount(data.imageCount);
        if (data.status === "completed") {
          await assemble(sessionId!);
        }
      } catch {
        // transient network hiccup — the next poll tick will retry
      }
    }

    pollRef.current = setInterval(poll, POLL_MS);
    poll();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, sessionId]);

  async function assemble(id: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    setPhase("assembling");
    try {
      const res = await fetch(`/api/scan-session/${id}/images`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't retrieve your scanned pages.");
      const files = (data.images as string[]).map((url, i) => dataUrlToFile(url, `page-${i + 1}.jpg`));
      const bytes = await buildPdfFromImages(files, { fitMode: "fit", pageSize: "auto" });
      setResult(bytes);
      setPhase("done");
    } catch (e: any) {
      setError(e?.message ?? "Couldn't build the PDF from your scanned pages.");
      setPhase("error");
    }
  }

  function reset() {
    setResult(null);
    startSession();
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {phase === "done" && result ? (
          <ResultPanel previewBytes={result} title="Your scan is ready" onDownload={() => downloadPdf(result, "scan.pdf")} onReset={reset} />
        ) : phase === "assembling" ? (
          <div className="paper-stack p-10 text-center">
            <FileImage className="mx-auto text-amber-dark animate-pulse" size={22} />
            <p className="mt-3 text-sm text-ink-faint">Building your PDF…</p>
          </div>
        ) : phase === "expired" ? (
          <div className="paper-stack p-10 text-center">
            <p className="text-sm text-ink-faint">This QR code expired after 15 minutes of inactivity.</p>
            <button
              onClick={startSession}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors"
            >
              <RefreshCw size={15} /> Get a new QR code
            </button>
          </div>
        ) : phase === "error" ? (
          <div className="paper-stack p-10 text-center">
            {error && <p className="text-sm text-rust-dark">{error}</p>}
            <button
              onClick={startSession}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark transition-colors"
            >
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        ) : phase === "loading" || !qrDataUrl ? (
          <div className="paper-stack p-10 text-center">
            <p className="text-sm text-ink-faint">Setting up…</p>
          </div>
        ) : (
          <div className="paper-stack overflow-hidden">
            <div className="p-6 text-center border-b border-paper-line">
              <p className="eyebrow text-ink-faint">Step 1</p>
              <p className="mt-1.5 text-sm font-medium text-ink">Use your smartphone's camera to scan this QR code</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR code to scan documents from your phone" className="mx-auto mt-4 h-[220px] w-[220px]" />
            </div>
            <div className="p-6 text-center">
              <p className="eyebrow text-ink-faint">Step 2</p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-paper-line px-3 py-1 text-sm font-medium">
                {status === "waiting" ? (
                  <>Disconnected 📴</>
                ) : (
                  <>
                    <Smartphone size={14} className="text-teal-dark" /> Connected
                    {imageCount > 0 ? ` · ${imageCount} page${imageCount === 1 ? "" : "s"} scanned` : ""}
                  </>
                )}
              </p>
              <p className="mt-3 text-sm text-ink-faint">
                To scan your documents, please follow the instructions on your mobile screen, and tap Save when
                you're done.
              </p>
              <p className="mt-1 text-sm font-medium text-ink">Do not close this tab.</p>
            </div>
          </div>
        )}
        {phase !== "assembling" && phase !== "done" && (
          <p className="mt-4 text-center text-xs text-ink-faint">
            Unlike the other tools here, your photos pass through our server to reach this tab — they're deleted
            immediately after your PDF is assembled.
          </p>
        )}
      </div>
    </div>
  );
}
