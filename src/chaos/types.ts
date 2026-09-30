/* ————————————————————————————————————————————————
   chaos button · shared types
   The event system is deliberately framework-agnostic:
   every event is a plain object with a run(ctx) function.
   To add a new event, append it to events.ts — nothing else.
———————————————————————————————————————————————— */

export interface BtnState {
  label: string;
  scale: number;
  rotate: number;
  visible: boolean;
  dx: number;
  dy: number;
}

export type CounterMode = "normal" | "roman" | "binary" | "wrong" | "minus" | "jackpot";

export interface CounterState {
  mode: CounterMode;
  delta: number;
}

export interface Fx {
  invert: boolean;
  mirror: boolean;
  tilt: boolean;
  frozen: boolean;
  hideCursor: boolean;
}
export type FxKey = keyof Fx;

export type ToastKind = "info" | "warn" | "ach";
export interface ToastMsg {
  id: number;
  kind: ToastKind;
  text: string;
}

export interface LineState {
  n: number;
  text: string;
  rare: boolean;
  committed: boolean;
  typing: boolean;
}

export interface LogEntry {
  key: number;
  n: number;
  text: string;
  rare: boolean;
}

export type Overlay = null | "void" | "bsod";

export interface Ghost {
  id: number;
  dx: number;
  dy: number;
  rot: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
}

/* the toolbox handed to every event */
export interface Ctx {
  n: number;
  calm: boolean;

  setBtn(patch: Partial<BtnState>): void;
  teleport(): void;
  shakeNow(): void;
  denyNext(): void;
  autoPressSoon(): void;

  pulse(key: FxKey, ms: number): void;
  flipLayout(v: boolean): void;
  setSwap(v: boolean): void;
  setCounter(mode: CounterMode, ms: number, delta?: number): void;
  ghosts(count: number): void;

  say(text: string, rare?: boolean): void;
  typeText(text: string, rare?: boolean): void;
  toast(text: string, kind?: ToastKind): void;
  unlock(id: string): void;
  later(fn: () => void, ms: number): void;

  loadingSeq(): void;
  voidSeq(): void;
  bsodSeq(): void;

  getLabel(): string;
  lastLine(): string | undefined;

  pick<T>(arr: readonly T[]): T;
  int(a: number, b: number): number;
}

export interface ChaosEvent {
  id: string;
  code: string; // field-guide code, e.g. "E-09"
  tag: string; // short codename, e.g. "SHRINK"
  line: string; // canonical log line (shown in the guide)
  weight?: number; // relative probability, default 10
  min?: number; // minimum presses before eligible
  once?: boolean; // only ever fires once
  when?: (s: { label: string }) => boolean; // extra eligibility gate
  run(ctx: Ctx): void;
}
