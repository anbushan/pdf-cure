"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import { LOCALES } from "@/lib/i18n/locales";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { extractPdfText } from "@/lib/extractText";
import { translatedTextToPdf } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { Languages } from "lucide-react";
import { useErrorToast } from "@/components/useErrorToast";
import AiDisclaimer from "@/components/AiDisclaimer";

const tool = getTool("translate")!;

type Stage = "idle" | "reading" | "translating" | "building" | "done" | "error";

export default function TranslateClient() {
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState("es");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [truncated, setTruncated] = useState(false);

  function handleFile(f: File) {
    setFile(f);
    setError(null);
    setStage("idle");
    setResult(null);
  }

  async function handleTranslate() {
    if (!file) return;
    setError(null);
    try {
      setStage("reading");
      const extracted = await extractPdfText(file);
      if (!extracted.text.trim()) {
        throw new Error("Couldn't find any selectable text in this PDF — it may be a scanned image without OCR.");
      }

      setStage("translating");
      const langLabel = LOCALES.find((l) => l.code === targetLang)?.englishName ?? targetLang;
      const res = await fetch("/api/pdf-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extracted.text, targetLanguage: langLabel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");

      setStage("building");
      const bytes = await translatedTextToPdf(data.translated, langLabel);
      setResult(bytes);
      setTruncated(Boolean(data.truncated) || extracted.truncated);
      setStage("done");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
      setStage("error");
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    setStage("idle");
  }

  const busy = stage === "reading" || stage === "translating" || stage === "building";
  const stageLabel = { reading: "Reading the PDF…", translating: "Translating…", building: "Rebuilding the PDF…" }[stage as "reading" | "translating" | "building"];

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-2xl px-6 mt-8">
        {result ? (
          <>
            <ResultPanel
              title="Translation complete"
              detail={truncated ? "This document was long, so the translation covers the first portion of the text." : undefined}
              onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_translated.pdf`)}
              onReset={reset}
            />
            <AiDisclaimer />
          </>
        ) : busy ? (
          <div className="paper-stack p-10 text-center">
            <Languages className="mx-auto text-violet-dark" size={22} />
            <p className="mt-3 text-sm text-ink-faint">{stageLabel}</p>
          </div>
        ) : (
          <div>
            {!file ? (
              <>
                <Dropzone
                  accept="application/pdf"
                  label="Select a PDF to translate"
                  hint="Extracted text is sent to Claude to generate the translation"
                  onFiles={(files) => handleFile(files[0])}
                />
                <p className="mt-3 text-xs text-ink-faint text-center">
                  Unlike the other tools here, this one sends document text to a server to generate the translation.
                </p>
              </>
            ) : (
              <div className="paper-stack p-6">
                <FilePreview file={file} className="mb-4" />

                <label className="text-sm font-medium text-ink">Translate to</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-paper-line bg-white px-3 py-2 text-sm"
                >
                  {LOCALES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName}
                      {l.nativeName !== l.englishName ? ` (${l.englishName})` : ""}
                    </option>
                  ))}
                </select>

                <div className="mt-4 rounded-md border border-paper-line bg-paper-dim px-3.5 py-3 text-xs leading-relaxed text-ink-faint">
                  <strong className="text-ink">How this works:</strong> text is extracted from your PDF, translated, and
                  rebuilt into a clean new PDF. This re-flows the content into a fresh layout rather than preserving the
                  original document's exact positioning, images, or icons pixel-for-pixel — true lossless translation
                  (identical layout, fonts, and graphics in a new language) isn't realistically possible without a
                  full desktop-publishing engine. For scripts like Chinese, Arabic, or Hindi, rendering goes through
                  your browser's own fonts, so results look correct regardless of language.
                </div>

                {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}

                <div className="mt-5 flex justify-end gap-3">
                  <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                    Cancel
                  </button>
                  <button
                    onClick={handleTranslate}
                    className="rounded-md bg-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-dark"
                  >
                    Translate PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
