import { useEffect, useRef, useState } from "react";
import type { PlaygroundInstance } from "@/widget";

interface LogEntry {
  id: number;
  label: string;
  detail: string;
}

let counter = 0;

export default function EventLog({ instance }: { instance: PlaygroundInstance | null }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!instance) return;
    const push = (label: string, detail: string) => {
      counter += 1;
      setEntries((prev) => [...prev.slice(-49), { id: counter, label, detail }]);
    };

    const offReady = instance.on("ready", () => push("ready", "widget initialized"));
    const offChange = instance.on("change", (e) => push("change", `edited "${e.language}"`));
    const offRun = instance.on("run", () => push("run", "preview executed"));
    const offReset = instance.on("reset", () => push("reset", "code restored to starter"));
    const offError = instance.on("error", (e) => push("error", e.message));

    return () => {
      offReady();
      offChange();
      offRun();
      offReset();
      offError();
    };
  }, [instance]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [entries]);

  return (
    <div
      ref={listRef}
      className="h-40 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-600"
    >
      {entries.length === 0 && <p className="text-slate-400">Interact with the playground to see events…</p>}
      {entries.map((entry) => (
        <div key={entry.id} className="flex gap-2 py-0.5">
          <span className="rounded bg-slate-200 px-1.5 py-0.5 font-semibold text-slate-700">{entry.label}</span>
          <span className="truncate text-slate-500">{entry.detail}</span>
        </div>
      ))}
    </div>
  );
}
