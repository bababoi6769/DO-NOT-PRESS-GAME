import type { Achievement } from "./types";

/* ————————————————————————————————
   trophies — most are discoverable by playing.
   nothing here is explained to the user upfront.
———————————————————————————————— */
export const ACHIEVEMENTS: Achievement[] = [
  { id: "curiosity", name: "CURIOSITY", desc: "press the button. once." },
  { id: "offender", name: "REPEAT OFFENDER", desc: "press it five times." },
  { id: "persistent", name: "PERSISTENT", desc: "twenty-five presses." },
  { id: "machine", name: "MACHINE", desc: "fifty presses." },
  { id: "centurion", name: "CENTURION", desc: "one hundred presses." },
  { id: "nihilist", name: "NIHILIST", desc: "witness absolutely nothing." },
  { id: "voidwalker", name: "VOIDWALKER", desc: "the void said hello back." },
  { id: "crash", name: "CRASH TESTED", desc: "survive a system failure." },
  { id: "patience", name: "PATIENCE", desc: "sit through a full calibration." },
  { id: "speedrunner", name: "SPEEDRUNNER", desc: "eight presses in two seconds." },
  { id: "lucky", name: "LUCKY SEVENS", desc: "hit the jackpot." },
  { id: "taxonomist", name: "TAXONOMIST", desc: "discover fifteen anomalies." },
  { id: "konami", name: "OLD SCHOOL", desc: "enter the code. you know the one." },
  { id: "inspector", name: "INSPECTOR", desc: "click the title seven times." },
  { id: "seismologist", name: "SEISMOLOGIST", desc: "cause an earthquake." },
  { id: "nightshift", name: "NIGHT SHIFT", desc: "press between midnight and five." },
  { id: "offhand", name: "OFF-HAND", desc: "try the other mouse button." },
];

/* alternate labels for the button */
export const LABELS = [
  "STILL DON'T",
  "FINE, PRESS",
  "PLEASE STOP",
  "AGAIN?",
  "YOU WERE WARNED",
  "NOT LIKE THAT",
  "GENTLY",
  "DON'T.",
  "OK NOW STOP",
  "PRESS RESPONSIBLY",
  "WRONG BUTTON",
  "ACHIEVEMENT UNLOC—",
] as const;

/* fake system notifications */
export const SYSTEM_NOTES = [
  "update 1.0.9 available: more consequences.",
  "warning: curiosity levels elevated.",
  "the button has been reported.",
  "battery low. spirit unaffected.",
  "cache cleared. regrets kept.",
  "diagnostics complete: user is the problem.",
  "chron job failed: doom postponed.",
  "nothing to report. reporting anyway.",
  "your session has been observed. favourable review.",
] as const;

export const ERROR_NOTES = [
  "0x000CH4OS — something went wrong.",
  "ERR_CURIOSITY: unhandled user.",
  "warning: consequences imminent.",
  "task failed successfully.",
  "integrity check skipped at user request.",
] as const;

/* cryptic typed messages */
export const MYSTERIES = [
  "it counts even when you don't look.",
  "somewhere, a log file grows.",
  "this was all in the spec.",
  "the red square sees you.",
  "you're doing great. probably.",
  "history is written by the persistent.",
  "the button has a drawer. you're in it.",
] as const;

/* counter glitches after enough presses */
export const toRoman = (num: number): string => {
  if (num <= 0 || num > 3999) return String(num);
  const table: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  let rest = num;
  for (const [v, sym] of table) {
    while (rest >= v) {
      out += sym;
      rest -= v;
    }
  }
  return out;
};
