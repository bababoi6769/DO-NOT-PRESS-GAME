import type { LineState, LogEntry } from "../chaos/types";

interface Props {
  counterLabel: string;
  counterDisplay: string;
  counterMuted: boolean;
  line: LineState | null;
  history: LogEntry[];
  trophies: string[];
  pad3: (n: number) => string;
}

const HISTORY_ROWS = 5;

export function Console({
  counterLabel,
  counterDisplay,
  counterMuted,
  line,
  history,
  trophies,
  pad3,
}: Props) {
  const rows = history.slice(0, HISTORY_ROWS);
  while (rows.length < HISTORY_ROWS) {
    rows.push(null as unknown as LogEntry);
  }

  return (
    <section className="px-5 pb-6 pt-5 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* counter strip */}
        <div className="flex items-baseline justify-between border-y border-[var(--line)] py-2.5">
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] tracking-[0.3em] text-[var(--ink-soft)]">
              {counterLabel}
            </span>
            <span className="font-display text-xl font-black tracking-[0.08em] tabular-nums">
              {counterMuted ? "——" : counterDisplay}
            </span>
          </div>
          <span className="text-[10px] tracking-[0.22em] text-[var(--ink-soft)]">
            {trophies.length > 0
              ? `TROPHIES ${String(trophies.length).padStart(2, "0")}`
              : "NO TROPHIES YET"}
          </span>
        </div>

        {/* current event line */}
        <div
          aria-live="polite"
          className="flex min-h-[34px] items-center border-b border-[var(--line)] py-2 text-[13px]"
        >
          {line ? (
            <span className={`tracking-[0.02em] ${line.rare ? "rare" : ""}`}>
              <span className="mr-3 text-[var(--ink-soft)]">{pad3(line.n)}</span>
              {line.text}
              {line.typing && <span className="caret" />}
            </span>
          ) : (
            <span className="tracking-[0.02em] text-[var(--ink-soft)]">
              ---
              <span className="mx-3" />
              awaiting poor decisions
            </span>
          )}
        </div>

        {/* history */}
        <ul className="text-[12px] leading-[1.9]">
          {rows.map((r, i) =>
            r ? (
              <li
                key={r.key}
                className={`flex items-baseline tracking-[0.02em] ${
                  i === 0 ? "anim-rise" : ""
                } ${r.rare ? "rare" : ""}`}
                style={{ opacity: 1 - i * 0.16 }}
              >
                <span className="mr-3 w-6 text-right text-[var(--ink-soft)]">{pad3(r.n)}</span>
                {r.text}
              </li>
            ) : (
              <li key={`empty-${i}`} className="flex items-baseline opacity-25">
                <span className="mr-3 w-6 text-right text-[var(--ink-soft)]">····</span>
                <span className="text-[var(--ink-soft)]">·</span>
              </li>
            ),
          )}
        </ul>

        {/* trophies — only appear once earned */}
        {trophies.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-dashed border-[var(--line)] pt-3">
            {trophies.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1.5 border border-[var(--ink)] px-2 py-0.5 text-[10px] tracking-[0.14em]"
              >
                <span className="block h-1.5 w-1.5 bg-[var(--red)]" />
                {t}
              </span>
            ))}
          </div>
        )}

        {/* footer note */}
        <p className="mt-4 text-right text-[10px] tracking-[0.08em] text-[var(--ink-soft)]">
          presses, trophies and field notes stay on this device. nothing is sent anywhere.
        </p>
      </div>
    </section>
  );
}
