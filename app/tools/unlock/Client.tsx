"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import FilePreview from "@/components/FilePreview";
import { unlockPdf } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";
import { Unlock, Eye, EyeOff } from "lucide-react";

const tool = getTool("unlock")!;

export default function UnlockClient() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);
  useErrorToast(error);

  async function handleUnlock() {
    if (!file) return;
    if (!password) {
      setError("Enter the PDF's password.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const bytes = await unlockPdf(file, password);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't unlock this PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setPassword("");
    setResult(null);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel
            title="Password removed"
            detail="This PDF now opens without a password."
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_unlocked.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a password-protected PDF" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6">
            <FilePreview file={file} className="mb-4" />

            <label className="text-sm font-medium text-ink">Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                placeholder="Enter the PDF's current password"
                autoFocus
                className="w-full rounded-md border border-paper-line bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-rust"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              We check the password locally in your browser — it's never sent anywhere. If it's wrong, you'll get a
              clear "doesn't match" message rather than a silent failure.
            </p>

            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                disabled={busy || !password}
                className="inline-flex items-center gap-2 rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                <Unlock size={15} /> {busy ? "Checking password…" : "Unlock PDF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
