import type { ChaosEvent, Ctx } from "./types";
import { ERROR_NOTES, LABELS, MYSTERIES, SYSTEM_NOTES } from "./data";

/* ————————————————————————————————————————————————
   THE ANOMALIES
   Each event is a self-contained object. To add a new one,
   append an entry here — the engine picks it up automatically,
   including its entry in the field guide.
———————————————————————————————————————————————— */
export const EVENTS: ChaosEvent[] = [
  {
    id: "flee",
    code: "E-01",
    tag: "FLEE",
    line: "the button fled.",
    run(c) {
      c.teleport();
      c.say(this.line);
      c.later(() => c.setBtn({ dx: 0, dy: 0 }), 5200);
    },
  },
  {
    id: "flinch",
    code: "E-02",
    tag: "FLINCH",
    line: "the page flinched.",
    run(c) {
      c.shakeNow();
      c.say(this.line);
    },
  },
  {
    id: "label",
    code: "E-03",
    tag: "LABEL",
    line: "the button changed its story.",
    run(c) {
      c.setBtn({ label: c.pick(LABELS) });
      c.say(this.line);
    },
  },
  {
    id: "restore",
    code: "E-04",
    tag: "AMENDS",
    line: "order restored. reluctantly.",
    weight: 14,
    when: (s) => s.label !== "DO NOT PRESS",
    run(c) {
      c.setBtn({ label: "DO NOT PRESS" });
      c.say(this.line);
    },
  },
  {
    id: "invert",
    code: "E-05",
    tag: "INVERT",
    line: "colors were, briefly, wrong.",
    weight: 8,
    run(c) {
      if (!c.calm) c.pulse("invert", 650);
      c.say(this.line);
    },
  },
  {
    id: "sysnote",
    code: "E-06",
    tag: "SYSNOTE",
    line: "a notification arrived.",
    run(c) {
      c.toast(c.pick(SYSTEM_NOTES), "info");
      c.say(this.line);
    },
  },
  {
    id: "error",
    code: "E-07",
    tag: "FAULT",
    line: "something went wrong. it got over it.",
    run(c) {
      c.toast(c.pick(ERROR_NOTES), "warn");
      c.say(this.line);
    },
  },
  {
    id: "freeze",
    code: "E-08",
    tag: "FREEZE",
    line: "everything stopped. then continued.",
    weight: 8,
    run(c) {
      c.say("button.exe is not responding.");
      c.pulse("frozen", 2100);
      c.later(() => c.toast("it responded. it apologizes.", "info"), 2300);
    },
  },
  {
    id: "small",
    code: "E-09",
    tag: "SHRINK",
    line: "the button is keeping a low profile.",
    run(c) {
      c.setBtn({ scale: 0.42 });
      c.say(this.line);
      c.later(() => c.setBtn({ scale: 1 }), 5000);
    },
  },
  {
    id: "large",
    code: "E-10",
    tag: "EGO",
    line: "the button believes in itself.",
    run(c) {
      c.setBtn({ scale: 1.5 });
      c.say(this.line);
      c.later(() => c.setBtn({ scale: 1 }), 5000);
    },
  },
  {
    id: "hide",
    code: "E-11",
    tag: "HIDE",
    line: "the button needed a moment alone.",
    weight: 8,
    run(c) {
      c.setBtn({ visible: false });
      c.say(this.line);
      c.later(() => {
        c.setBtn({ visible: true });
        c.toast("it came back.", "info");
      }, 1800);
    },
  },
  {
    id: "ghosts",
    code: "E-12",
    tag: "GHOSTS",
    line: "it left copies of itself.",
    weight: 8,
    run(c) {
      c.ghosts(6);
      c.say(this.line);
    },
  },
  {
    id: "refuse",
    code: "E-13",
    tag: "REFUSE",
    line: "the button is in a mood.",
    weight: 8,
    run(c) {
      c.denyNext();
      c.say(this.line);
    },
  },
  {
    id: "counter-format",
    code: "E-14",
    tag: "CONVERT",
    line: "the counter converted.",
    run(c) {
      const roman = c.pick([true, false]);
      c.setCounter(roman ? "roman" : "binary", 6000);
      c.say(roman ? "the counter went full caesar." : "the counter speaks computer now.");
    },
  },
  {
    id: "counter-glitch",
    code: "E-15",
    tag: "IMPROV",
    line: "the counter is improvising.",
    run(c) {
      const wrong = c.pick([true, false]);
      if (wrong) {
        c.setCounter("wrong", 4200, c.int(1, 99));
        c.say(this.line);
      } else {
        c.setCounter("minus", 3400);
        c.say("one of the presses was un-pressed.");
      }
    },
  },
  {
    id: "rearrange",
    code: "E-16",
    tag: "REARRANGE",
    line: "the interface rearranged itself.",
    weight: 7,
    run(c) {
      c.flipLayout(true);
      c.pulse("tilt", 6000);
      c.say(this.line);
      c.later(() => c.flipLayout(false), 6000);
    },
  },
  {
    id: "swap",
    code: "E-17",
    tag: "SWAP",
    line: "the label and the number swapped jobs.",
    weight: 8,
    run(c) {
      c.setSwap(true);
      c.setBtn({ label: `#${String(c.n).padStart(3, "0")}` });
      c.say(this.line);
      c.later(() => {
        c.setSwap(false);
        c.setBtn({ label: "DO NOT PRESS" });
      }, 6000);
    },
  },
  {
    id: "mystery",
    code: "E-18",
    tag: "WHISPER",
    line: "a message, typed by nobody.",
    weight: 8,
    run(c) {
      c.typeText(c.pick(MYSTERIES), true);
    },
  },
  {
    id: "loading",
    code: "E-19",
    tag: "CALIBRATE",
    line: "a harmless loading sequence.",
    weight: 6,
    run(c) {
      c.loadingSeq();
    },
  },
  {
    id: "nothing",
    code: "E-20",
    tag: "NOTHING",
    line: "…",
    weight: 2,
    run(c) {
      c.say("…");
      c.later(() => {
        c.toast("you witnessed nothing. it was noted.", "info");
        c.unlock("nihilist");
      }, 2100);
    },
  },
  {
    id: "jackpot",
    code: "E-21",
    tag: "JACKPOT",
    line: "jackpot. none of this is redeemable.",
    weight: 1,
    min: 20,
    run(c) {
      c.setCounter("jackpot", 2800);
      c.say(this.line, true);
      c.unlock("lucky");
    },
  },
  {
    id: "void",
    code: "E-22",
    tag: "VOID",
    line: "the void said hello back.",
    weight: 1,
    min: 12,
    run(c) {
      c.voidSeq();
    },
  },
  {
    id: "bsod",
    code: "E-23",
    tag: "CRASH",
    line: "the system recovered. it denies everything.",
    weight: 2,
    min: 8,
    run(c) {
      c.bsodSeq();
    },
  },
  {
    id: "selfpress",
    code: "E-24",
    tag: "AUTONOMY",
    line: "the button pressed itself.",
    weight: 7,
    min: 4,
    run(c) {
      c.autoPressSoon();
    },
  },
  {
    id: "spin",
    code: "E-25",
    tag: "SPIN",
    line: "the button turned its back.",
    weight: 8,
    run(c) {
      c.setBtn({ rotate: 180 });
      c.say(this.line);
      c.later(() => c.setBtn({ rotate: 0 }), 5200);
    },
  },
  {
    id: "cursor",
    code: "E-26",
    tag: "CURSOR",
    line: "the cursor stepped out.",
    weight: 7,
    run(c) {
      c.say(this.line);
      c.pulse("hideCursor", 2600);
      c.later(() => c.toast("the cursor returned.", "info"), 2800);
    },
  },
  {
    id: "mirror",
    code: "E-27",
    tag: "MIRROR",
    line: "everything, mirrored.",
    weight: 6,
    min: 6,
    run(c) {
      if (!c.calm) c.pulse("mirror", 3800);
      c.say(this.line);
    },
  },
  {
    id: "echo",
    code: "E-28",
    tag: "ECHO",
    line: "history repeated itself.",
    weight: 8,
    run(c) {
      const last = c.lastLine();
      c.say(last ?? this.line);
    },
  },
];

/* ————————————————————————————————————————————————
   MILESTONES — deterministic beats on specific press counts.
   These override the random pool for that press.
———————————————————————————————— */
export const MILESTONES: Record<number, (c: Ctx) => void> = {
  1: (c) => c.say("you were told not to."),
  2: (c) => c.say("twice now."),
  3: (c) => c.say("a third time. it noticed."),
  7: (c) => c.say("seven. it keeps count."),
  10: (c) => c.say("ten presses. the button is concerned."),
  13: (c) => c.typeText("thirteen.", true),
  25: (c) => c.typeText("twenty-five. a pattern is forming."),
  42: (c) => c.say("forty-two. no further questions."),
  50: (c) => c.typeText("fifty. the button has filed paperwork."),
  69: (c) => c.say("sixty-nine. nice. moving on."),
  77: (c) => c.say("seventy-seven. double luck. still nothing."),
  100: (c) => c.typeText("one hundred. the counter requests a raise.", true),
  111: (c) => c.say("one-one-one. make a wish. it won't help."),
  150: (c) => c.say("one-fifty. this is a lifestyle now."),
  200: (c) => c.say("two hundred. it stops counting out loud."),
  500: (c) => c.typeText("five hundred. the button respects you. finally.", true),
};

export const TOTAL_EVENTS = EVENTS.length;
