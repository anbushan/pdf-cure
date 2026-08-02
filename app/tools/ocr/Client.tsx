"use client";

import { useState } from "react";
import { ScanText } from "lucide-react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { ocrPdf, OcrProgress } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("ocr")!;

const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "ita", label: "Italian" },
  { code: "por", label: "Portuguese" },
  { code: "nld", label: "Dutch" },
  { code: "rus", label: "Russian" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
  { code: "ara", label: "Arabic" },
  { code: "hin", label: "Hindi" },
];

export default function OcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("eng");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);

  async function handleOcr() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setProgress(null);
    try {
      const res = await ocrPdf(file, language, setProgress);
      setResult(res.bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't run OCR on this PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(null);
  }

  const percent = progress
    ? Math.round(((progress.page - 1 + progress.progress) / progress.totalPages) * 100)
    : 0;

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel
            title="PDF is now searchable"
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_ocr.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone
            accept="application/pdf"
            label="Select a scanned PDF"
            hint="The first run downloads an OCR engine (a few MB) — after that it works offline"
            onFiles={(f) => setFile(f[0])}
          />
        ) : busy ? (
          <div className="paper-stack p-10 text-center">
            <ScanText className="mx-auto text-amber-dark animate-pulse" size={22} />
            <p className="mt-3 text-sm text-ink-faint">
              {progress ? `Reading page ${progress.page} of ${progress.totalPages}…` : "Starting…"}
            </p>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-paper-dim">
              <div className="h-full rounded-full bg-amber transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>
        ) : (
          <div className="paper-stack p-6 text-center">
            <p className="text-sm font-mono text-ink-faint">{file.name}</p>

            <label className="mt-4 block text-left text-sm font-medium text-ink">Document language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>

            <p className="mt-3 text-xs text-ink-faint">
              This recognizes text in each page's image and layers it back in invisibly, so the page looks exactly the
              same but becomes searchable and selectable. Recognition runs entirely in your browser — nothing is
              uploaded — though larger or lower-quality scans can take a while, especially on the first page while the
              OCR engine loads.
            </p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleOcr}
                disabled={busy}
                className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
              >
                Run OCR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
