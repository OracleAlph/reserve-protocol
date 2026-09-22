import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function formatElapsed(ms: number): string {
  const total = Math.max(0, ms) / 1000;
  const m = Math.floor(total / 60);
  const s = total - m * 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
}

export function elapsedToSeconds(ms: number): number {
  return Math.round((ms / 1000) * 100) / 100;
}

export function Stopwatch({
  onCommit,
  label,
  commitLabel = "Record trial",
}: {
  onCommit: (seconds: number) => void;
  label?: string;
  commitLabel?: string;
}) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);
  const base = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (startedAt.current != null) {
        setElapsed(base.current + (performance.now() - startedAt.current));
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [running]);

  const start = () => {
    startedAt.current = performance.now();
    setRunning(true);
  };

  const pause = () => {
    if (startedAt.current != null) {
      base.current += performance.now() - startedAt.current;
      startedAt.current = null;
    }
    setRunning(false);
    setElapsed(base.current);
  };

  const reset = () => {
    setRunning(false);
    startedAt.current = null;
    base.current = 0;
    setElapsed(0);
  };

  const commit = () => {
    if (running) pause();
    const seconds = elapsedToSeconds(base.current || elapsed);
    if (seconds > 0) onCommit(seconds);
  };

  return (
    <div className="rounded-lg bg-bg-elevated p-4">
      {label ? (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
          {label}
        </p>
      ) : null}
      <div
        className={cn(
          "font-display text-4xl tabular-nums tracking-tight text-ink sm:text-5xl",
        )}
        aria-live="polite"
      >
        {formatElapsed(elapsed)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {running ? (
          <Button type="button" variant="secondary" onClick={pause}>
            <Pause /> Pause
          </Button>
        ) : (
          <Button type="button" onClick={start}>
            <Play /> Start
          </Button>
        )}
        <Button type="button" variant="outline" onClick={reset}>
          <RotateCcw /> Reset
        </Button>
        <Button type="button" variant="sage" onClick={commit} disabled={elapsed <= 0}>
          {commitLabel}
        </Button>
      </div>
    </div>
  );
}
