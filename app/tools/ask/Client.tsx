"use client";

import { useEffect, useRef, useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import { extractPdfText } from "@/lib/extractText";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import { useErrorToast } from "@/components/useErrorToast";
import AiDisclaimer from "@/components/AiDisclaimer";
import { trackEvent } from "@/lib/analytics";

const tool = getTool("ask")!;

interface Turn {
  role: "user" | "assistant";
  content: string;
}

export default function AskPage() {
  const [file, setFile] = useState<File | null>(null);
  const [docText, setDocText] = useState("");
  const [reading, setReading] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, busy]);

  async function handleFile(f: File) {
    setFile(f);
    setError(null);
    setReading(true);
    try {
      const extracted = await extractPdfText(f);
      if (!extracted.text.trim()) {
        throw new Error("Couldn't find any selectable text in this PDF — it may be a scanned image without OCR.");
      }
      setDocText(extracted.text);
      setTurns([{ role: "assistant", content: `I've read ${f.name}. Ask me anything about it.` }]);
    } catch (e: any) {
      setError(e?.message ?? "Couldn't read this PDF.");
      setFile(null);
    } finally {
      setReading(false);
    }
  }

  async function send() {
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    const nextTurns = [...turns, { role: "user" as const, content: question }];
    setTurns(nextTurns);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/pdf-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: docText, question, history: turns }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setTurns((prev) => [...prev, { role: "assistant", content: data.answer }]);
      trackEvent("tool_success", { page: "/tools/ask" });
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setDocText("");
    setTurns([]);
    setInput("");
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-2xl px-6 mt-8">
        {!file ? (
          <>
            <Dropzone
              accept="application/pdf"
              label="Select a PDF to ask about"
              hint="Extracted text is sent to Claude to answer your questions"
              onFiles={(files) => handleFile(files[0])}
            />
            <p className="mt-3 text-xs text-ink-faint text-center">
              Unlike the other tools here, this one sends document text to a server to answer questions.
            </p>
          </>
        ) : reading ? (
          <div className="paper-stack p-10 text-center">
            <Sparkles className="mx-auto text-violet-dark" size={22} />
            <p className="mt-3 text-sm text-ink-faint">Reading the PDF…</p>
          </div>
        ) : (
          <div className="paper-stack p-5 flex flex-col" style={{ height: 520 }}>
            <div className="flex items-center justify-between border-b border-paper-line pb-3">
              <p className="text-sm font-mono text-ink-faint truncate">{file.name}</p>
              <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-faint hover:text-ink shrink-0">
                <RotateCcw size={12} /> New file
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {turns.map((t, i) => (
                <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      t.role === "user" ? "bg-ink text-paper" : "bg-violet-light text-ink"
                    }`}
                  >
                    {t.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg bg-violet-light px-3.5 py-2.5 text-sm text-ink-faint">Thinking…</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            {error && <p className="text-xs text-rust-dark mb-2">{error}</p>}
            <div className="flex items-center gap-2 border-t border-paper-line pt-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask a question about this document…"
                className="flex-1 rounded-md border border-paper-line bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                className="rounded-md bg-violet p-2.5 text-white hover:bg-violet-dark disabled:opacity-40"
                aria-label="Send"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
        {file && !reading && <AiDisclaimer />}
      </div>
    </div>
  );
}
