import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type {
  BtnState,
  ChaosEvent,
  CounterState,
  Ctx,
  Fx,
  FxKey,
  Ghost,
  LineState,
  LogEntry,
  Overlay,
  ToastKind,
  ToastMsg,
} from "../chaos/types";
import { EVENTS, MILESTONES } from "../chaos/events";
import { ACHIEVEMENTS, toRoman } from "../chaos/data";
import { setSoundEnabled, sfx } from "../chaos/audio";

const STORE_KEY = "chaosbutton:v1";
const DEFAULT_BTN: BtnState = {
  label: "DO NOT PRESS",
  scale: 1,
  rotate: 0,
  visible: true,
  dx: 0,
  dy: 0,
};

interface Persisted {
  presses: number;
  unlocked: string[];
  discovered: Record<string, number>;
  sound: boolean;
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) throw new Error("empty");
    const p = JSON.parse(raw) as Partial<Persisted>;
    return {
      presses: typeof p.presses === "number" ? p.presses : 0,
      unlocked: Array.isArray(p.unlocked) ? p.unlocked : [],
      discovered: p.discovered && typeof p.discovered === "object" ? p.discovered : {},
      sound: typeof p.sound === "boolean" ? p.sound : true,
    };
  } catch {
    return { presses: 0, unlocked: [], discovered: {}, sound: true };
  }
}

const pad3 = (n: number) => String(n).padStart(3, "0");

export function useChaos() {
  const initial = useMemo(load, []);

  /* ————— persisted ————— */
  const [presses, setPressesState] = useState(initial.presses);
  const [unlocked, setUnlocked] = useState<string[]>(initial.unlocked);
  const [discovered, setDiscoveredState] = useState<Record<string, number>>(initial.discovered);
  const [soundOn, setSoundOn] = useState(initial.sound);

  /* ————— live chaos state ————— */
  const [btn, setBtn] = useState<BtnState>(DEFAULT_BTN);
  const [fx, setFxState] = useState<Fx>({
    invert: false,
    mirror: false,
    tilt: false,
    frozen: false,
    hideCursor: false,
  });
  const [shakeNonce, setShakeNonce] = useState(0);
  const [denyNonce, setDenyNonce] = useState(0);
  const [autoPress, setAutoPress] = useState(false);
  const [line, setLine] = useState<LineState | null>(null);
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [counter, setCounterState] = useState<CounterState>({ mode: "normal", delta: 0 });
  const [swapJobs, setSwapJobsState] = useState(false);
  const [ghostsState, setGhostsState] = useState<Ghost[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  /* ————— refs for use inside timeouts/listeners ————— */
  const pressesRef = useRef(presses);
  const btnRef = useRef(btn);
  btnRef.current = btn;
  const fxRef = useRef(fx);
  const lineRef = useRef<LineState | null>(null);
  const historyRef = useRef<LogEntry[]>([]);
  historyRef.current = history;
  const unlockedRef = useRef(new Set(unlocked));
  const discoveredRef = useRef(discovered);
  const timers = useRef<number[]>([]);
  const typingRef = useRef<number | null>(null);
  const keySeq = useRef(0);
  const toastSeq = useRef(0);
  const refusalArmed = useRef(false);
  const lastIds = useRef<string[]>([]);
  const pressTimes = useRef<number[]>([]);
  const logoClicks = useRef(0);
  const logoTimer = useRef<number | null>(null);
  const idleFired = useRef(false);
  const seismicLog = useRef<Array<{ t: number; x: number }>>([]);
  const seismicCooldown = useRef(0);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const btnElRef = useRef<HTMLButtonElement | null>(null);
  const calm = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const setPresses = useCallback((n: number) => {
    pressesRef.current = n;
    setPressesState(n);
  }, []);

  /* ————— persistence ————— */
  useEffect(() => {
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ presses, unlocked, discovered, sound: soundOn }),
      );
    } catch {
      /* private mode — fine, chaos is ephemeral anyway */
    }
  }, [presses, unlocked, discovered, soundOn]);

  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      if (typingRef.current) window.clearInterval(typingRef.current);
    },
    [],
  );

  /* ————— core helpers ————— */
  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  const cancelTyping = useCallback(() => {
    if (typingRef.current) {
      window.clearInterval(typingRef.current);
      typingRef.current = null;
    }
  }, []);

  const pushHistory = useCallback((entry: LogEntry) => {
    setHistory((h) => [entry, ...h].slice(0, 60));
  }, []);

  const replaceLine = useCallback(
    (next: LineState) => {
      const prev = lineRef.current;
      if (prev && prev.committed && prev.text.length > 0) {
        pushHistory({ key: ++keySeq.current, n: prev.n, text: prev.text, rare: prev.rare });
      }
      lineRef.current = next;
      setLine(next);
    },
    [pushHistory],
  );

  const say = useCallback(
    (text: string, rare = false) => {
      cancelTyping();
      replaceLine({ n: pressesRef.current, text, rare, committed: true, typing: false });
    },
    [cancelTyping, replaceLine],
  );

  const typeText = useCallback(
    (final: string, rare = false) => {
      cancelTyping();
      const n = pressesRef.current;
      let i = 0;
      replaceLine({ n, text: "", rare, committed: false, typing: true });
      typingRef.current = window.setInterval(() => {
        i += 1;
        if (i % 3 === 0) sfx.blip();
        const done = i >= final.length;
        if (done && typingRef.current) {
          window.clearInterval(typingRef.current);
          typingRef.current = null;
        }
        const next: LineState = {
          n,
          text: final.slice(0, i),
          rare,
          committed: done,
          typing: !done,
        };
        lineRef.current = next;
        setLine(next);
      }, 36);
    },
    [cancelTyping, replaceLine],
  );

  const toast = useCallback(
    (text: string, kind: ToastKind = "info") => {
      const id = ++toastSeq.current;
      setToasts((t) => [...t, { id, kind, text }].slice(-4));
      if (kind === "warn") sfx.warn();
      else if (kind === "info") sfx.note();
      later(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "ach" ? 5200 : 3600);
    },
    [later],
  );

  const unlock = useCallback(
    (id: string) => {
      if (unlockedRef.current.has(id)) return;
      unlockedRef.current.add(id);
      setUnlocked(Array.from(unlockedRef.current));
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      sfx.unlock();
      if (a) toast(`trophy — ${a.name.toLowerCase()}: ${a.desc}`, "ach");
    },
    [toast],
  );

  const pulse = useCallback(
    (key: FxKey, ms: number) => {
      if (calm && (key === "invert" || key === "mirror")) return;
      fxRef.current = { ...fxRef.current, [key]: true };
      setFxState(fxRef.current);
      later(() => {
        fxRef.current = { ...fxRef.current, [key]: false };
        setFxState(fxRef.current);
      }, ms);
    },
    [calm, later],
  );

  const shakeNow = useCallback(() => {
    if (calm) return;
    setShakeNonce((n) => n + 1);
  }, [calm]);

  const teleport = useCallback(() => {
    const stage = stageRef.current?.getBoundingClientRect();
    const el = btnElRef.current?.getBoundingClientRect();
    if (!stage) return;
    const bw = el?.width ?? 280;
    const bh = el?.height ?? 90;
    const hw = Math.max(0, (stage.width - bw) / 2 - 22);
    const hh = Math.max(0, (stage.height - bh) / 2 - 22);
    const rnd = (range: number) => (range <= 0 ? 0 : (Math.random() * 2 - 1) * range);
    setBtn((b) => ({ ...b, dx: Math.round(rnd(hw)), dy: Math.round(rnd(hh)) }));
  }, []);

  const setCounterFor = useCallback(
    (mode: CounterState["mode"], ms: number, delta = 0) => {
      setCounterState({ mode, delta });
      later(() => setCounterState({ mode: "normal", delta: 0 }), ms);
    },
    [later],
  );

  const ghostBurst = useCallback(
    (count: number) => {
      const arr: Ghost[] = Array.from({ length: count }, (_, i) => ({
        id: i + Date.now(),
        dx: Math.round((Math.random() * 2 - 1) * 190),
        dy: Math.round((Math.random() * 2 - 1) * 120),
        rot: Math.round((Math.random() * 2 - 1) * 10),
      }));
      setGhostsState(arr);
      later(() => setGhostsState([]), 1200);
    },
    [later],
  );

  const markDiscovered = useCallback(
    (ev: ChaosEvent) => {
      if (discoveredRef.current[ev.id] != null) return;
      const next = { ...discoveredRef.current, [ev.id]: pressesRef.current };
      discoveredRef.current = next;
      setDiscoveredState(next);
      if (Object.keys(next).length >= 15) unlock("taxonomist");
    },
    [unlock],
  );

  /* ————— special sequences ————— */
  const loadingSeq = useCallback(() => {
    const n = pressesRef.current;
    const steps = 16;
    let i = 0;
    let mine: LineState | null = null;
    const tick = () => {
      /* if another event replaced our line, stop quietly */
      if (mine !== null && lineRef.current !== mine) return;
      i += 1;
      const pct = Math.round((i / steps) * 100);
      const filled = Math.round((i / steps) * 12);
      const bar = "█".repeat(filled) + "·".repeat(12 - filled);
      const next: LineState = {
        n,
        text: `calibrating entropy ${bar} ${pct}%`,
        rare: false,
        committed: false,
        typing: false,
      };
      mine = next;
      lineRef.current = next;
      setLine(next);
      if (i < steps) later(tick, 110);
      else {
        say("calibration complete. nothing changed.");
        unlock("patience");
      }
    };
    later(tick, 160);
  }, [later, say, unlock]);

  const voidSeq = useCallback(() => {
    sfx.rare();
    setOverlay("void");
    unlock("voidwalker");
    later(() => {
      setOverlay(null);
      say("the void said hello back.", true);
    }, 3600);
  }, [later, say, unlock]);

  const bsodSeq = useCallback(() => {
    sfx.rare();
    setOverlay("bsod");
    unlock("crash");
    later(() => {
      setOverlay(null);
      say("the system recovered. it denies everything.", true);
    }, 3900);
  }, [later, say, unlock]);

  const autoPressSoon = useCallback(() => {
    later(() => {
      setAutoPress(true);
      sfx.press();
      later(() => setAutoPress(false), 240);
      const n = pressesRef.current + 1;
      setPresses(n);
      countChecks(n);
      say("the button pressed itself.");
    }, 950);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [later, setPresses, say]);

  /* ————— the Ctx handed to events ————— */
  const makeCtx = useCallback(
    (n: number): Ctx => ({
      n,
      calm,
      setBtn: (patch) => setBtn((b) => ({ ...b, ...patch })),
      teleport,
      shakeNow,
      denyNext: () => {
        refusalArmed.current = true;
      },
      autoPressSoon,
      pulse,
      flipLayout: setFlipped,
      setSwap: setSwapJobsState,
      setCounter: setCounterFor,
      ghosts: ghostBurst,
      say,
      typeText,
      toast,
      unlock,
      later,
      loadingSeq,
      voidSeq,
      bsodSeq,
      getLabel: () => btnRef.current.label,
      lastLine: () => historyRef.current[0]?.text,
      pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
      int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
    }),
    [
      calm,
      teleport,
      shakeNow,
      autoPressSoon,
      pulse,
      setCounterFor,
      ghostBurst,
      say,
      typeText,
      toast,
      unlock,
      later,
      loadingSeq,
      voidSeq,
      bsodSeq,
    ],
  );

  /* ————— achievement checks tied to counts ————— */
  const countChecks = useCallback(
    (n: number) => {
      if (n >= 1) unlock("curiosity");
      if (n === 5) unlock("offender");
      if (n === 25) unlock("persistent");
      if (n === 50) unlock("machine");
      if (n === 100) unlock("centurion");
      const h = new Date().getHours();
      if (h >= 0 && h < 5) unlock("nightshift");
    },
    [unlock],
  );

  const speedCheck = useCallback(() => {
    const now = Date.now();
    pressTimes.current = [...pressTimes.current.filter((t) => now - t < 2000), now];
    if (pressTimes.current.length >= 8) unlock("speedrunner");
  }, [unlock]);

  /* ————— weighted random dispatcher ————— */
  const pickEvent = useCallback((): ChaosEvent | null => {
    const label = btnRef.current.label;
    let pool = EVENTS.filter(
      (e) => (e.min ?? 0) <= pressesRef.current && (!e.when || e.when({ label })),
    );
    const fresh = pool.filter((e) => !lastIds.current.includes(e.id));
    if (fresh.length >= 5) pool = fresh;
    if (pool.length === 0) return null;
    const bag: ChaosEvent[] = [];
    for (const e of pool) {
      const w = e.weight ?? 10;
      for (let i = 0; i < w; i++) bag.push(e);
    }
    return bag[Math.floor(Math.random() * bag.length)];
  }, []);

  /* ————— THE PRESS ————— */
  const press = useCallback(() => {
    if (fxRef.current.frozen) return;

    if (refusalArmed.current) {
      refusalArmed.current = false;
      sfx.deny();
      setDenyNonce((d) => d + 1);
      say("it refused.");
      return;
    }

    sfx.press();
    const n = pressesRef.current + 1;
    setPresses(n);
    countChecks(n);
    speedCheck();

    const ctx = makeCtx(n);
    const milestone = MILESTONES[n];
    if (milestone) {
      milestone(ctx);
      return;
    }
    const ev = pickEvent();
    if (!ev) {
      say("nothing happened. suspicious.");
      return;
    }
    lastIds.current = [...lastIds.current, ev.id].slice(-5);
    markDiscovered(ev);
    ev.run(ctx);
  }, [setPresses, countChecks, speedCheck, makeCtx, pickEvent, markDiscovered, say]);

  /* ————— hidden interaction: right click ————— */
  const rightClick = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      if (fxRef.current.frozen) return;
      sfx.deny();
      unlock("offhand");
      say("wrong hand. but noted.");
    },
    [unlock, say],
  );

  /* ————— hidden interaction: title clicking ————— */
  const logoClick = useCallback(() => {
    logoClicks.current += 1;
    if (logoTimer.current) window.clearTimeout(logoTimer.current);
    logoTimer.current = window.setTimeout(() => {
      logoClicks.current = 0;
    }, 2400);
    if (logoClicks.current >= 7) {
      unlock("inspector");
      toast("you clicked the title. thorough.", "info");
      logoClicks.current = 0;
    }
  }, [unlock, toast]);

  /* ————— hidden interaction: konami ————— */
  useEffect(() => {
    const code = [
      "arrowup",
      "arrowup",
      "arrowdown",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "arrowleft",
      "arrowright",
      "b",
      "a",
    ];
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      pos = k === code[pos] ? pos + 1 : k === code[0] ? 1 : 0;
      if (pos === code.length) {
        pos = 0;
        sfx.konami();
        unlock("konami");
        typeText("↑ ↑ ↓ ↓ ← → ← → b a", true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlock, typeText]);

  /* ————— hidden interaction: mouse seismograph ————— */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now < seismicCooldown.current) return;
      const log = seismicLog.current;
      log.push({ t: now, x: e.clientX });
      if (log.length > 26) log.shift();
      const recent = log.filter((p) => now - p.t < 900);
      if (recent.length < 10) return;
      let flips = 0;
      let prevDir = 0;
      for (let i = 1; i < recent.length; i++) {
        const dx = recent[i].x - recent[i - 1].x;
        const dt = Math.max(1, recent[i].t - recent[i - 1].t);
        if (Math.abs(dx) / dt < 0.9) continue; // too slow to count
        const dir = Math.sign(dx);
        if (dir !== 0 && prevDir !== 0 && dir !== prevDir) flips += 1;
        if (dir !== 0) prevDir = dir;
      }
      if (flips >= 7) {
        seismicCooldown.current = now + 20000;
        seismicLog.current = [];
        unlock("seismologist");
        toast("seismic activity logged. the page is fine.", "warn");
        setShakeNonce((n) => n + 1);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [unlock]);

  /* ————— hidden interaction: idleness ————— */
  useEffect(() => {
    if (idleFired.current) return;
    const id = window.setTimeout(() => {
      idleFired.current = true;
      toast("the button wonders where you went.", "info");
    }, 50000);
    return () => window.clearTimeout(id);
  }, [presses, toast]);

  /* ————— esc closes the guide ————— */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGuideOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleSound = useCallback(() => setSoundOn((v) => !v), []);

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
    window.location.reload();
  }, []);

  /* ————— derived counter display ————— */
  const counterDisplay = (() => {
    const n = presses;
    switch (counter.mode) {
      case "roman":
        return toRoman(n);
      case "binary":
        return n.toString(2);
      case "wrong":
        return String(n + counter.delta);
      case "minus":
        return String(Math.max(0, n - 1));
      case "jackpot":
        return "777";
      default:
        return String(n).padStart(4, "0");
    }
  })();

  return {
    // data
    presses,
    counterDisplay,
    counterLabel: swapJobs ? "DO NOT PRESS" : "PRESSES",
    counterMuted: swapJobs,
    // button
    btn,
    autoPress,
    denyNonce,
    frozen: fx.frozen,
    // effects
    fx,
    shakeNonce,
    overlay,
    ghosts: ghostsState,
    flipped,
    // narrative
    line,
    history,
    toasts,
    pad3,
    // meta
    unlocked,
    discovered,
    discoveredCount: Object.keys(discovered).length,
    totalEvents: EVENTS.length,
    soundOn,
    guideOpen,
    // refs
    stageRef,
    btnElRef,
    // actions
    press,
    rightClick,
    logoClick,
    toggleSound,
    setGuideOpen,
    resetAll,
  };
}
