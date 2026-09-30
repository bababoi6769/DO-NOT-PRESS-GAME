import { useEffect, useState } from "react";
import { AlertTriangle, Info, Trophy, X } from "lucide-react";
import type { Overlay, ToastMsg } from "../chaos/types";
import { EVENTS } from "../chaos/events";
import { ACHIEVEMENTS } from "../chaos/data";

/* ————————— toasts ————————— */

export function Toasts({ toasts }: { toasts: ToastMsg[] }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-16 z-40 flex w-[min(300px,86vw)] flex-col items-stretch gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="anim-toast hard-sm flex items-start gap-2.5 border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-2.5"
        >
          <span
            className={`mt-[1px] shrink-0 ${t.kind === "info" ? "text-[var(--ink-soft)]" : "rare"}`}
          >
            {t.kind === "ach" ? (
              <Trophy size={14} strokeWidth={2} />
            ) : t.kind === "warn" ? (
              <AlertTriangle size={14} strokeWidth={2} />
            ) : (
              <Info size={14} strokeWidth={2} />
            )}
          </span>
          <div className="min-w-0">
            <div className="text-[10px] tracking-[0.22em] text-[var(--ink-soft)]">
              {t.kind === "ach" ? "TROPHY" : t.kind === "warn" ? "ERR" : "SYS"}
            </div>
            <div className="text-[12px] leading-snug">{t.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ————————— the void ————————— */

function VoidOverlay() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const a = window.setTimeout(() => setPhase(1), 600);
    const b = window.setTimeout(() => setPhase(2), 1700);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0a08]"
      style={{ animation: "k-voidin 0.5s ease both" }}
    >
      <div className="flex flex-col items-center gap-6">
        {phase >= 1 && (
          <span
            className="block h-3.5 w-3.5 bg-[var(--red)]"
            style={{ animation: "k-voiddot 0.7s cubic-bezier(0.2,0.8,0.3,1) both" }}
          />
        )}
        {phase >= 2 && (
          <span className="text-[12px] tracking-[0.3em] text-[#f2efe7] opacity-70">hello.</span>
        )}
      </div>
    </div>
  );
}

/* ————————— fake system failure ————————— */

const BSOD_LINES = [
  "CHAOS_OS (build 4.0.4)",
  "",
  "an unhandled exception occurred in module: CURIOSITY.SYS",
  "fault address: 0xD0_N07_PR355",
  "",
  "press any key to pretend this never happened",
  "recovering ......... 100%    everything is fine.",
];

function BsodOverlay() {
  const [shown, setShown] = useState(1);
  useEffect(() => {
    if (shown >= BSOD_LINES.length) return;
    const id = window.setTimeout(() => setShown((s) => s + 1), 320);
    return () => window.clearTimeout(id);
  }, [shown]);
  return (
    <div className="fixed inset-0 z-50 bg-[var(--blue)] px-6 py-10 text-[#e8ecff] sm:px-16">
      <div className="mx-auto max-w-2xl text-[13px] leading-[2] tracking-[0.04em] sm:text-[14px]">
        {BSOD_LINES.slice(0, shown).map((l, i) => (
          <p key={i} className="anim-rise">
            {l || " "}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ————————— field guide ————————— */

interface GuideProps {
  discovered: Record<string, number>;
  unlocked: string[];
  onClose: () => void;
  onReset: () => void;
}

function Guide({ discovered, unlocked, onClose, onReset }: GuideProps) {
  const [arming, setArming] = useState(false);
  useEffect(() => {
    if (!arming) return;
    const id = window.setTimeout(() => setArming(false), 3000);
    return () => window.clearTimeout(id);
  }, [arming]);

  const found = Object.keys(discovered).length;
  const pad = (n: number) => String(n).padStart(3, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[rgba(24,21,17,0.45)]"
      />
      <div className="anim-guide hard-lg relative flex max-h-[84vh] w-full max-w-2xl flex-col border-2 border-[var(--ink)] bg-[var(--paper)]">
        <header className="flex items-center justify-between border-b-2 border-[var(--ink)] px-5 py-3">
          <div>
            <div className="font-display text-[15px] font-black tracking-[0.14em]">FIELD GUIDE</div>
            <div className="mt-0.5 text-[10px] tracking-[0.18em] text-[var(--ink-soft)]">
              ANOMALIES OBSERVED IN THE WILD · {found}/{EVENTS.length}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center border border-[var(--line)] transition-colors hover:border-[var(--ink)]"
            aria-label="close guide"
          >
            <X size={14} />
          </button>
        </header>

        <div className="grid flex-1 gap-0 overflow-auto sm:grid-cols-[1fr_240px]">
          {/* anomalies */}
          <ol className="px-5 py-3 text-[12px] leading-[2.1]">
            {EVENTS.map((e) => {
              const first = discovered[e.id];
              return (
                <li
                  key={e.id}
                  className="flex items-baseline justify-between gap-3 border-b border-dashed border-[var(--line)] py-[3px] last:border-b-0"
                >
                  <span className="flex min-w-0 items-baseline gap-2.5">
                    <span className="w-9 shrink-0 text-[var(--ink-soft)]">{e.code}</span>
                    {first != null ? (
                      <span className="truncate">{e.line}</span>
                    ) : (
                      <span className="tracking-[0.3em] text-[var(--ink-soft)]">··········</span>
                    )}
                  </span>
                  <span className="shrink-0 text-[10px] text-[var(--ink-soft)]">
                    {first != null ? `@${pad(first)}` : "———"}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* trophies */}
          <div className="border-t-2 border-[var(--ink)] px-5 py-3 sm:border-l-2 sm:border-t-0">
            <div className="mb-2 text-[10px] tracking-[0.25em] text-[var(--ink-soft)]">
              TROPHIES {unlocked.length}/{ACHIEVEMENTS.length}
            </div>
            <ul className="text-[11px] leading-[1.5]">
              {ACHIEVEMENTS.map((a) => {
                const got = unlocked.includes(a.id);
                return (
                  <li key={a.id} className="mb-2.5">
                    <div
                      className={`flex items-center gap-1.5 tracking-[0.12em] ${got ? "" : "text-[var(--ink-soft)]"}`}
                    >
                      <span
                        className={`block h-1.5 w-1.5 ${got ? "bg-[var(--red)]" : "bg-[var(--line)]"}`}
                      />
                      {got ? a.name : "??????"}
                    </div>
                    {got && <div className="ml-3 text-[var(--ink-soft)]">{a.desc}</div>}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-[var(--line)] px-5 py-2.5">
          <span className="text-[10px] tracking-[0.1em] text-[var(--ink-soft)]">
            keep pressing. it keeps happening.
          </span>
          <button
            onClick={() => (arming ? onReset() : setArming(true))}
            className={`cursor-pointer text-[10px] tracking-[0.18em] ${
              arming ? "rare font-semibold" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            {arming ? "ARE YOU SURE?" : "RESET ALL DATA"}
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ————————— composed ————————— */

interface OverlayHostProps {
  overlay: Overlay;
  guideOpen: boolean;
  discovered: Record<string, number>;
  unlocked: string[];
  onCloseGuide: () => void;
  onReset: () => void;
}

export function OverlayHost({
  overlay,
  guideOpen,
  discovered,
  unlocked,
  onCloseGuide,
  onReset,
}: OverlayHostProps) {
  return (
    <>
      {overlay === "void" && <VoidOverlay />}
      {overlay === "bsod" && <BsodOverlay />}
      {guideOpen && (
        <Guide
          discovered={discovered}
          unlocked={unlocked}
          onClose={onCloseGuide}
          onReset={onReset}
        />
      )}
    </>
  );
}
