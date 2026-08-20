"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { bankStatementToExcel } from "@/lib/pdfTools";
import { downloadBytes, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";

const tool = getTool("bank-statement-to-excel")!;

export default function BankStatementToExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const [result, setResult] = useState<Uint8Array | null>(null);

  async function handleConvert() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = await bankStatementToExcel(file);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't convert this statement.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel
            title="Transactions extracted to Excel"
            detail="Date, Description, Debit, Credit, and Balance columns"
            onDownload={() =>
              downloadBytes(result, `${stripExt(file!.name)}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            }
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a bank statement PDF" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6 text-center">
            <FilePreview file={file} className="text-left" />
            <p className="mt-3 text-xs text-ink-faint">
              Each line that starts with a date becomes a transaction row; wrapped description lines are folded back in, and whether
              an amount is a debit or credit is worked out from whether the balance went up or down. This is tuned for the common
              passbook-style layout — unusual formats may need a little manual cleanup after export. For a scanned statement with no
              selectable text, run OCR PDF first.
            </p>
            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleConvert}
                disabled={busy}
                className="rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark disabled:opacity-40"
              >
                {busy ? "Converting…" : "Convert to Excel"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
