import { AlertTriangle } from "lucide-react";

export default function AiDisclaimer() {
  return (
    <div className="mt-4 flex items-start gap-2.5 rounded-md border border-amber/40 bg-amber-light/30 px-3.5 py-2.5">
      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-dark" />
      <p className="text-xs leading-relaxed text-ink-faint">
        <strong className="text-ink">AI can make mistakes.</strong> Double-check anything important — names, numbers,
        dates, and legal or medical details in particular — against the original document before relying on it.
      </p>
    </div>
  );
}
