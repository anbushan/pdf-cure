"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";

export interface PctBox {
  id: string;
  xPercent: number;
  yPercent: number;
  wPercent: number;
  hPercent: number;
  /** Per-box fill override (a CSS color) — omit for the default solid black used by redaction. */
  color?: string;
}

interface Props {
  imageSrc: string;
  boxes: PctBox[];
  onAdd: (box: PctBox) => void;
  onRemove: (id: string) => void;
  /** Color assigned to newly drawn boxes; omit for the default solid black (redaction). */
  boxColor?: string;
}

export default function RedactCanvas({ imageSrc, boxes, onAdd, onRemove, boxColor }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const dragging = useRef(false);

  function toPercent(clientX: number, clientY: number) {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }

  function start(e: React.PointerEvent) {
    dragging.current = true;
    const { x, y } = toPercent(e.clientX, e.clientY);
    setDraft({ x0: x, y0: y, x1: x, y1: y });
  }

  function move(e: React.PointerEvent) {
    if (!dragging.current || !draft) return;
    const { x, y } = toPercent(e.clientX, e.clientY);
    setDraft({ ...draft, x1: x, y1: y });
  }

  function end() {
    if (!dragging.current || !draft) return;
    dragging.current = false;
    const x = Math.min(draft.x0, draft.x1);
    const y = Math.min(draft.y0, draft.y1);
    const w = Math.abs(draft.x1 - draft.x0);
    const h = Math.abs(draft.y1 - draft.y0);
    setDraft(null);
    if (w > 1.5 && h > 1.5) {
      onAdd({ id: crypto.randomUUID(), xPercent: x, yPercent: y, wPercent: w, hPercent: h, ...(boxColor ? { color: boxColor } : {}) });
    }
  }

  const draftBox = draft
    ? {
        left: Math.min(draft.x0, draft.x1),
        top: Math.min(draft.y0, draft.y1),
        width: Math.abs(draft.x1 - draft.x0),
        height: Math.abs(draft.y1 - draft.y0),
      }
    : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none touch-none overflow-hidden rounded border border-paper-line cursor-crosshair"
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerLeave={end}
    >
      <img src={imageSrc} alt="Page preview" className="block w-full pointer-events-none" draggable={false} />
      {boxes.map((b) => (
        <div
          key={b.id}
          className={`absolute group ${b.color ? "" : "bg-ink"}`}
          style={{
            left: `${b.xPercent}%`,
            top: `${b.yPercent}%`,
            width: `${b.wPercent}%`,
            height: `${b.hPercent}%`,
            ...(b.color ? { backgroundColor: b.color } : {}),
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(b.id);
            }}
            className="absolute -top-2 -right-2 hidden h-5 w-5 items-center justify-center rounded-full bg-rust text-white group-hover:flex"
          >
            <X size={11} />
          </button>
        </div>
      ))}
      {draftBox && (
        <div
          className="absolute border-2 border-amber bg-amber/20"
          style={{ left: `${draftBox.left}%`, top: `${draftBox.top}%`, width: `${draftBox.width}%`, height: `${draftBox.height}%` }}
        />
      )}
    </div>
  );
}
