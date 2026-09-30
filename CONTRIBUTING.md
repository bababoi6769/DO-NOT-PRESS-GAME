# Contributing

The most common change to this project is **adding an anomaly**, and the codebase
was built so that it only ever requires editing one file. Everything below assumes
Node 22+ and a clean `npm ci`.

## Getting set up

```bash
npm ci
npm run dev        # http://localhost:5173
```

Before opening a pull request, run the same gate CI runs:

```bash
npm run verify     # format:check → typecheck → test → build
```

## Adding an anomaly

Append an entry to `EVENTS` in [`src/chaos/events.ts`](src/chaos/events.ts).
The engine picks it up automatically — including its row in the field guide — so
there is no registry to update anywhere else.

```ts
{
  id: "sombrero",            // unique, kebab-case, used for discovery tracking
  code: "E-29",              // field-guide code; must stay unique and in ascending order
  tag: "SOMBRERO",           // short codename shown in the guide
  line: "the button put on a hat.",   // canonical log line; must be unique
  weight: 8,                 // optional, default 10 — relative draw probability
  min: 6,                    // optional — not eligible before press 6
  when: (s) => s.label !== "X",       // optional — extra eligibility gate
  run(c) {
    c.setBtn({ label: "HAT MODE" });
    c.say(this.line);        // `this` is the event, so `line` is always in sync
  },
}
```

Rules the test suite enforces:

- `id` and `code` are unique across all events; `code` matches `E-\d{2}` and the
  list stays sorted, so append at the end rather than inserting.
- `line` and `tag` are non-empty, and no two events share a `line`.
- `weight` is positive and `min` is a positive integer.
- If your event calls `c.unlock("some-id")`, that id must exist in `ACHIEVEMENTS`
  in [`src/chaos/data.ts`](src/chaos/data.ts) — and every trophy must be
  reachable. Orphaned trophies fail the build.

### The `Ctx` toolbox

`run(ctx)` receives everything an anomaly is allowed to touch; see
[`src/chaos/types.ts`](src/chaos/types.ts) for the full surface. The short version:

| Call                                       | Effect                                                                |
| ------------------------------------------ | --------------------------------------------------------------------- |
| `say(text, rare?)`                         | commit a line to the console instantly                                |
| `typeText(text, rare?)`                    | same, but typed character by character                                |
| `toast(text, kind?)`                       | system / error / trophy notification                                  |
| `setBtn(patch)`                            | move, scale, rotate, relabel or hide the button                       |
| `teleport()`                               | fling the button somewhere else in the chamber                        |
| `pulse(fx, ms)`                            | timed page effect: `invert`, `mirror`, `tilt`, `frozen`, `hideCursor` |
| `flipLayout(v)` / `setSwap(v)`             | rearrange the page, or swap the label and the counter                 |
| `setCounter(mode, ms)`                     | roman / binary / wrong / minus / jackpot counter                      |
| `ghosts(n)`                                | leave n dashed decoy buttons behind                                   |
| `shakeNow()` / `denyNext()`                | flinch the page / make the next press get refused                     |
| `later(fn, ms)`                            | run something after a delay (cleaned up on unmount)                   |
| `loadingSeq()` / `voidSeq()` / `bsodSeq()` | the three set pieces                                                  |
| `pick(arr)` / `int(a, b)`                  | seeded-free randomness helpers                                        |

### House style for copy

The console has one voice: lowercase, clipped, understated, and never winking at
the player. Outcomes are stated as facts about the button's behaviour, not as
jokes delivered to the user. A good line reads like a log entry; a bad line reads
like a caption.

- Good: `the button needed a moment alone.`
- Bad: `LOL the button ran away 😂`

Prefer one sentence. Reserve `rare: true` for genuinely rare events — `--red` is
the only accent colour and it stops meaning anything if everything is red.

## Adding a trophy

Add it to `ACHIEVEMENTS` in [`src/chaos/data.ts`](src/chaos/data.ts) and award it
with `c.unlock(id)` from an event, or from an interaction in
[`src/hooks/useChaos.ts`](src/hooks/useChaos.ts). Keep the `desc` phrased as the
instruction that earns it, e.g. `"press the button. once."`.

## Adding a milestone

`MILESTONES` in `events.ts` maps an exact press count to a deterministic beat,
which overrides the random pool for that press. These are the narrative spine, so
they are deliberately sparse — round numbers, and numbers that mean something.

## Accessibility

Non-negotiable, and reviewers will ask:

- Every new timed effect must respect `ctx.calm` (`prefers-reduced-motion`).
  Movement, inversion and mirroring are suppressed for those players; text,
  toasts and counter changes are not — those are the game.
- New UI must be reachable by keyboard and announced by screen readers. The
  console line is an `aria-live="polite"` region; toasts are too.
- Never trap focus, and never disable the guide's close affordance.

## Commit messages

Conventional Commits, please — `feat:`, `fix:`, `docs:`, `chore:`, `test:`,
`refactor:`. One logical change per commit.
