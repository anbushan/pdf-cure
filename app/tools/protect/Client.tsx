"use client";

import { useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import ResultPanel from "@/components/ResultPanel";
import { protectPdf } from "@/lib/pdfTools";
import { downloadPdf, stripExt } from "@/lib/download";
import { useErrorToast } from "@/components/useErrorToast";
import { Lock, Eye, EyeOff } from "lucide-react";

const tool = getTool("protect")!;

function passwordStrength(pw: string): { label: string; className: string } {
  if (pw.length === 0) return { label: "", className: "" };
  if (pw.length < 6) return { label: "Weak — use at least 6 characters", className: "text-rust-dark" };
  if (pw.length < 10) return { label: "Okay", className: "text-amber-dark" };
  return { label: "Strong", className: "text-teal-dark" };
}

export default function ProtectClient() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);
  useErrorToast(error);

  const strength = passwordStrength(password);
  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleProtect() {
    if (!file) return;
    if (!password) {
      setError("Set a password first.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const bytes = await protectPdf(file, password);
      setResult(bytes);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't protect this PDF.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setPassword("");
    setConfirm("");
    setResult(null);
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-xl px-6 mt-8">
        {result ? (
          <ResultPanel
            title="Your PDF is protected"
            detail="Encrypted with AES-256 — anyone opening it will need the password you set."
            onDownload={() => downloadPdf(result, `${stripExt(file!.name)}_protected.pdf`)}
            onReset={reset}
          />
        ) : !file ? (
          <Dropzone accept="application/pdf" label="Select a PDF to protect" onFiles={(f) => setFile(f[0])} />
        ) : (
          <div className="paper-stack p-6">
            <p className="text-sm font-mono text-ink-faint mb-4 truncate">{file.name}</p>

            <label className="text-sm font-medium text-ink">Set a password</label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Choose a password"
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
            {strength.label && <p className={`mt-1 text-xs ${strength.className}`}>{strength.label}</p>}

            <label className="mt-4 block text-sm font-medium text-ink">Confirm password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleProtect()}
              placeholder="Type it again"
              className={`mt-1.5 w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rust ${
                mismatch ? "border-rust" : "border-paper-line"
              }`}
            />
            {mismatch && <p className="mt-1 text-xs text-rust-dark">Passwords don't match yet.</p>}

            <p className="mt-3 text-xs text-ink-faint">
              Encryption happens locally in your browser (AES-256) — your password and file never leave your device.
              There's no password recovery: if you lose it, the file can't be opened by anyone, including you.
            </p>

            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Cancel
              </button>
              <button
                onClick={handleProtect}
                disabled={busy || !password || !confirm}
                className="inline-flex items-center gap-2 rounded-md bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark disabled:opacity-40"
              >
                <Lock size={15} /> {busy ? "Encrypting…" : "Protect PDF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
