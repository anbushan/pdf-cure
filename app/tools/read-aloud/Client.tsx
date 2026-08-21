"use client";

import { useEffect, useRef, useState } from "react";
import { getTool } from "@/lib/toolsConfig";
import ToolHeader from "@/components/ToolHeader";
import Dropzone from "@/components/Dropzone";
import FilePreview from "@/components/FilePreview";
import { extractPagesText } from "@/lib/pdfTools";
import { useErrorToast } from "@/components/useErrorToast";
import { trackEvent } from "@/lib/analytics";
import { Play, Pause, Square, ChevronLeft, ChevronRight } from "lucide-react";

const tool = getTool("read-aloud")!;

const RATES = [0.75, 1, 1.25, 1.5, 2];

export default function ReadAloudPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<string[] | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useErrorToast(error);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);

  const playingRef = useRef(false);
  const pageIndexRef = useRef(0);

  // Voices load asynchronously in most browsers.
  useEffect(() => {
    function loadVoices() {
      const list = window.speechSynthesis?.getVoices() ?? [];
      if (list.length) {
        setVoices(list);
        setVoiceURI((prev) => prev || list.find((v) => v.lang.startsWith("en"))?.voiceURI || list[0].voiceURI);
      }
    }
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // Stop playback if the page is left or a new file is loaded.
  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  async function handleFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setBusy(true);
    setError(null);
    try {
      const extracted = await extractPagesText(f);
      if (!extracted.some((p) => p.trim())) throw new Error("Couldn't find any selectable text in this PDF — scanned pages need OCR first.");
      setFile(f);
      setPages(extracted);
      setPageIndex(0);
      trackEvent("tool_success", { page: "/tools/read-aloud" });
    } catch (e: any) {
      setError(e?.message ?? "Couldn't read this PDF.");
    } finally {
      setBusy(false);
    }
  }

  function speakPage(index: number) {
    if (!pages) return;
    window.speechSynthesis.cancel();
    const text = pages[index]?.trim();
    if (!text) {
      // Empty page — skip straight to the next one rather than sitting silent.
      advance(index);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.voiceURI === voiceURI);
    if (voice) utter.voice = voice;
    utter.rate = rate;
    utter.onend = () => {
      if (playingRef.current) advance(index);
    };
    utter.onerror = () => {
      setPlaying(false);
      playingRef.current = false;
    };
    window.speechSynthesis.speak(utter);
  }

  function advance(fromIndex: number) {
    if (!pages) return;
    const next = fromIndex + 1;
    if (next >= pages.length) {
      setPlaying(false);
      playingRef.current = false;
      return;
    }
    pageIndexRef.current = next;
    setPageIndex(next);
    speakPage(next);
  }

  function handlePlay() {
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      setPlaying(true);
      playingRef.current = true;
      return;
    }
    setPlaying(true);
    playingRef.current = true;
    speakPage(pageIndex);
  }

  function handlePause() {
    window.speechSynthesis.pause();
    setPaused(true);
    setPlaying(false);
    playingRef.current = false;
  }

  function handleStop() {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
    playingRef.current = false;
  }

  function goToPage(index: number) {
    if (!pages) return;
    const clamped = Math.max(0, Math.min(pages.length - 1, index));
    pageIndexRef.current = clamped;
    setPageIndex(clamped);
    if (playing || paused) {
      setPaused(false);
      playingRef.current = true;
      setPlaying(true);
      speakPage(clamped);
    }
  }

  function reset() {
    window.speechSynthesis?.cancel();
    setFile(null);
    setPages(null);
    setPageIndex(0);
    setPlaying(false);
    setPaused(false);
    playingRef.current = false;
    setError(null);
  }

  return (
    <div className="pb-24">
      <ToolHeader tool={tool} />
      <div className="mx-auto max-w-2xl px-6 mt-8">
        {!file || !pages ? (
          <Dropzone accept="application/pdf" label="Select a PDF" onFiles={handleFile} hint={busy ? "Reading document…" : undefined} />
        ) : (
          <div className="paper-stack p-6">
            <FilePreview file={file} className="mb-5" />

            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink">
                Page {pageIndex + 1} of {pages.length}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => goToPage(pageIndex - 1)}
                  disabled={pageIndex === 0}
                  className="rounded-md border border-paper-line p-1.5 text-ink-faint hover:text-ink disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => goToPage(pageIndex + 1)}
                  disabled={pageIndex >= pages.length - 1}
                  className="rounded-md border border-paper-line p-1.5 text-ink-faint hover:text-ink disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="mt-3 max-h-64 overflow-y-auto rounded-md border border-paper-line bg-white p-4 text-sm leading-relaxed text-ink whitespace-pre-wrap">
              {pages[pageIndex]?.trim() || <span className="text-ink-faint italic">(This page has no readable text.)</span>}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-ink-faint mb-1">Voice</label>
                <select
                  value={voiceURI}
                  onChange={(e) => setVoiceURI(e.target.value)}
                  className="w-full rounded-md border border-paper-line bg-white px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                >
                  {voices.length === 0 && <option value="">Default</option>}
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-faint mb-1">Speed</label>
                <select
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="w-full rounded-md border border-paper-line bg-white px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber"
                >
                  {RATES.map((r) => (
                    <option key={r} value={r}>
                      {r}×
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-rust-dark">{error}</p>}

            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={reset} className="rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink">
                Choose another file
              </button>
              {playing ? (
                <button
                  onClick={handlePause}
                  className="inline-flex items-center gap-1.5 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark"
                >
                  <Pause size={16} /> Pause
                </button>
              ) : (
                <button
                  onClick={handlePlay}
                  className="inline-flex items-center gap-1.5 rounded-md bg-amber px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-dark"
                >
                  <Play size={16} /> {paused ? "Resume" : "Play"}
                </button>
              )}
              <button
                onClick={handleStop}
                disabled={!playing && !paused}
                className="inline-flex items-center gap-1.5 rounded-md border border-paper-line px-5 py-2.5 text-sm font-medium text-ink-faint hover:text-ink disabled:opacity-30"
              >
                <Square size={14} /> Stop
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
