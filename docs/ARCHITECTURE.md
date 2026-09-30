# Architecture

The game is one screen, one button, and a great deal of mischief. This document
explains how the mischief is organised so that new behaviour can be added without
touching the parts that already work.

## The shape of it

```
index.html            single <div id="root">, no fonts or scripts from anywhere else
src/
  main.tsx            React root
  App.tsx             composes TopBar / Stage / Console / Overlays; owns no state
  index.css           design tokens, the button, page-level fx, keyframes
  styles/fonts.css    @font-face for the two self-hosted families
  assets/fonts/       the actual woff2 files + their OFL licences
  chaos/              everything that is not React
    types.ts          BtnState, Fx, Ctx, ChaosEvent, … (framework-agnostic)
    data.ts           trophies, label decks, notification decks, toRoman
    events.ts         the EVENTS catalogue + MILESTONES
    audio.ts          oscillator-only sound effects, no audio files
  components/         presentational only; every prop is handed down
    TopBar.tsx  Stage.tsx  Console.tsx  Overlays.tsx
  hooks/
    useChaos.ts       the whole engine: state, timers, achievements, input
  utils/cn.ts         clsx + tailwind-merge
tests/chaos.test.ts   registry-consistency and copy-deck guarantees
```

The dependency direction is strictly one-way: `components` → `hooks` → `chaos`.
`chaos/` never imports React, and it never imports from `components/`. That is
what makes an anomaly a plain object rather than a component, and it is the rule
most worth protecting in review.

## The anomaly engine

An anomaly is a data record, not a special case in a switch statement:

```ts
{ id, code, tag, line, weight?, min?, once?, when?, run(ctx) }
```

`press()` in `useChaos.ts` is the only place that decides what happens on a click:

1. Bail out if a `FREEZE` pulse is active.
2. If a refusal was armed by `REFUSE`, consume it, play the deny animation and stop.
3. Increment the press counter, run the count- and speed-based trophy checks.
4. If the new count has a `MILESTONE`, run it and stop. These are the deterministic
   story beats and they take priority over randomness.
5. Otherwise `pickEvent()` draws from the weighted pool and the event's `run()`
   is handed a `Ctx`.

`pickEvent()` applies three filters before drawing:

- **eligibility** — `min` (press count) and `when` (a predicate over the current
  label), so an event can decline to fire in states where it would read wrong;
- **repeat suppression** — if at least five candidates are "fresh" (not among the
  last five drawn), the recently-seen ones are dropped entirely. This is what stops
  the same joke landing twice in a row;
- **weighting** — each event is pushed into a bag `weight` times and one entry is
  drawn. Weight is a relative frequency, not a probability.

## Ctx: the capability boundary

Events never touch React state, refs or timers directly. They receive a `Ctx`
object built fresh on every press. This buys three things:

- **Testability and reasoning.** Everything an anomaly can do is enumerable in one
  interface in `types.ts`; if it is not on `Ctx`, an anomaly cannot do it.
- **Cleanup.** `later()` is the only scheduling primitive, and every id it returns
  is collected in a `ref` and cleared on unmount. No event can leak a timer.
- **Reduced motion.** `Ctx.calm` is computed once from
  `prefers-reduced-motion: reduce`, and `pulse()` refuses to apply `invert` or
  `mirror` when it is set. Movement effects are suppressed centrally rather than
  in twenty event bodies.

## State and persistence

All engine state lives in a single `useChaos()` hook. Mutable values that must be
read from inside timers or event callbacks (`presses`, `btn`, `fx`, `history`,
discovered ids, timer ids) are mirrored into refs, because a closure created three
seconds ago would otherwise read stale state.

Progress — press count, unlocked trophy ids, discovered anomaly ids and the sound
preference — is written to `localStorage` under `chaosbutton:v1` on every change.
The `v1` suffix is the migration seam: a breaking change to that shape gets a
`v2` key and a read-time migration rather than a corrupt-state bug.

Nothing else is persisted, and nothing is transmitted. See "Privacy" below.

## Effects: two layers

Page-level effects are CSS classes toggled by the `fx` object — `.fx-invert`,
`.fx-mirror`, `.fx-tilt`, `.fx-frozen`, `.fx-nocursor`, `.fx-shake`. Each is a
timed pulse except `frozen`, which the engine also checks before allowing a press.

Element-level effects (the button teleporting, scaling, rotating, ghosts) are
transforms on a wrapper element rather than on the button itself. This matters:
the button's own `:hover` and `:active` rules apply their own transform for the
physical press feel, and keeping the two on separate elements stops them from
overwriting each other.

## Audio

`chaos/audio.ts` synthesises everything from oscillators — there are no audio
files in the repository. This keeps the build a single file and means no asset
loading, decoding or CORS concerns. The `AudioContext` is created lazily on first
use, because browsers refuse to start one before a user gesture; every entry point
checks `ctx.state === "suspended"` and resumes.

## Build

`vite build` produces **one file**: `dist/index.html`. `vite-plugin-singlefile`
inlines the JS and CSS, and `build.assetsInlineLimit` is raised so the woff2 fonts
become data URIs too. `build.modulePreload.polyfill` is turned off because nothing
is code-split — Vite's polyfill would otherwise be dead weight and the only
`fetch()` in the bundle.

## Privacy

The game makes no network requests at runtime, at all. There is no analytics, no
telemetry, no font CDN and no external image. Fonts are vendored specifically so
this stays true, and the CI job greps the built file for `fetch(`,
`XMLHttpRequest`, `WebSocket`, `sendBeacon` and `href="http` and fails if any of
them appear. High scores, trophies and discovery state live in `localStorage` and
nowhere else — which is what the footer under the console promises the player.
