import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  ACHIEVEMENTS,
  ERROR_NOTES,
  LABELS,
  MYSTERIES,
  SYSTEM_NOTES,
  toRoman,
} from "../src/chaos/data";
import { EVENTS, MILESTONES, TOTAL_EVENTS } from "../src/chaos/events";

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

const source = {
  engine: read("../src/hooks/useChaos.ts"),
  events: read("../src/chaos/events.ts"),
  overlays: read("../src/components/Overlays.tsx"),
};

/** Every `unlock("id")` target written anywhere in the app. */
function unlockTargets(): string[] {
  const ids = new Set<string>();
  for (const file of Object.values(source)) {
    for (const [, id] of file.matchAll(/unlock\(\s*"([a-z-]+)"/g)) ids.add(id);
  }
  return [...ids];
}

describe("toRoman", () => {
  it("renders the counter values the CONVERT anomaly can produce", () => {
    expect(toRoman(1)).toBe("I");
    expect(toRoman(4)).toBe("IV");
    expect(toRoman(9)).toBe("IX");
    expect(toRoman(42)).toBe("XLII");
    expect(toRoman(1987)).toBe("MCMLXXXVII");
    expect(toRoman(3999)).toBe("MMMCMXCIX");
  });

  it("falls back to digits outside the representable range instead of throwing", () => {
    expect(toRoman(0)).toBe("0");
    expect(toRoman(-3)).toBe("-3");
    expect(toRoman(4000)).toBe("4000");
  });
});

describe("anomaly registry", () => {
  it("exposes a non-empty catalogue", () => {
    expect(EVENTS.length).toBeGreaterThan(0);
    expect(TOTAL_EVENTS).toBe(EVENTS.length);
  });

  it("uses unique ids and unique field-guide codes", () => {
    expect(new Set(EVENTS.map((e) => e.id)).size).toBe(EVENTS.length);
    expect(new Set(EVENTS.map((e) => e.code)).size).toBe(EVENTS.length);
  });

  it("formats every code as E-nn and keeps them in order", () => {
    const codes = EVENTS.map((e) => e.code);
    for (const code of codes) expect(code).toMatch(/^E-\d{2}$/);
    expect(codes).toEqual([...codes].sort());
  });

  it("gives every anomaly a usable log line, tag and positive weight", () => {
    for (const e of EVENTS) {
      expect(e.line.trim(), `${e.id} has an empty line`).not.toBe("");
      expect(e.tag.trim(), `${e.id} has an empty tag`).not.toBe("");
      expect(e.weight ?? 10, `${e.id} has a non-positive weight`).toBeGreaterThan(0);
      expect(typeof e.run, `${e.id} has no run()`).toBe("function");
    }
  });

  it("never shows the player the same sentence twice", () => {
    const lines = EVENTS.map((e) => e.line);
    expect(new Set(lines).size).toBe(lines.length);
  });

  it("gates nothing on an impossible press count", () => {
    for (const e of EVENTS) {
      if (e.min == null) continue;
      expect(Number.isInteger(e.min)).toBe(true);
      expect(e.min).toBeGreaterThan(0);
    }
  });
});

describe("milestones", () => {
  it("keys onto positive integer press counts", () => {
    for (const key of Object.keys(MILESTONES)) {
      const n = Number(key);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThan(0);
    }
  });

  it("includes the opening beat so press #1 is never random", () => {
    expect(MILESTONES[1]).toBeTypeOf("function");
  });
});

describe("achievements", () => {
  it("exposes a non-empty, uniquely identified set", () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length);
  });

  it("gives every trophy a name and an unlock description", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.name.trim(), `${a.id} has no name`).not.toBe("");
      expect(a.desc.trim(), `${a.id} has no description`).not.toBe("");
    }
  });

  it("only ever unlocks ids that exist — no orphaned trophies", () => {
    const known = new Set(ACHIEVEMENTS.map((a) => a.id));
    const missing = unlockTargets().filter((id) => !known.has(id));
    expect(missing, `unlock() called with unknown ids: ${missing.join(", ")}`).toEqual([]);
  });

  it("has reachable trophies — nothing is defined but never awarded", () => {
    const awarded = new Set(unlockTargets());
    const unreachable = ACHIEVEMENTS.map((a) => a.id).filter((id) => !awarded.has(id));
    expect(unreachable, `never awarded: ${unreachable.join(", ")}`).toEqual([]);
  });
});

describe("the copy decks", () => {
  const decks = { LABELS, SYSTEM_NOTES, ERROR_NOTES, MYSTERIES };

  it("are all non-empty", () => {
    for (const [name, deck] of Object.entries(decks)) {
      expect(deck.length, `${name} is empty`).toBeGreaterThan(0);
    }
  });

  it("contain no duplicates, so a repeat is never a typo", () => {
    for (const [name, deck] of Object.entries(decks)) {
      expect(new Set(deck).size, `${name} repeats itself`).toBe(deck.length);
    }
  });
});
