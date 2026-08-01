"use client";

import { useRef, useState } from "react";

interface Props {
  onChange: (dataUrl: string | null) => void;
}

export default function SignaturePad({ onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);

  function ctx() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const c = ctx();
    if (!c) return;
    const { x, y } = getPos(e);
    c.beginPath();
    c.moveTo(x, y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const c = ctx();
    if (!c) return;
    const { x, y } = getPos(e);
    c.lineWidth = 2.5;
    c.lineCap = "round";
    c.strokeStyle = "#1C2129";
    c.lineTo(x, y);
    c.stroke();
    setHasStroke(true);
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const c = ctx();
    if (!canvas || !c) return;
    c.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
    onChange(null);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={480}
        height={160}
        className="w-full touch-none rounded-md border border-paper-line bg-white"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-ink-faint">Draw your signature above</p>
        <button onClick={clear} disabled={!hasStroke} className="text-xs font-medium text-rust-dark disabled:opacity-30">
          Clear
        </button>
      </div>
    </div>
  );
}
