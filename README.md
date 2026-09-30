<div align="center">

# CHAOS BUTTON

**An interactive experiment in poor decision making.**

One button. It is labelled `DO NOT PRESS`.
There are 28 anomalies waiting inside it.

[Quick start](#quick-start) · [How it works](#how-it-works) · [Field guide](#discovery) · [Contributing](#contributing)

</div>

---

## What this is

A single-screen browser toy with a straight face. You press a red button that
explicitly asked you not to, and the page responds — the button flees, relabels
itself, divides, changes shape, forgets English, refuses your input, and on rare
occasions takes the whole screen away from you.

It is not a game with a score. It is an instrument that records your behaviour,
and it has opinions about it. The presses counter is the only number, and it
stops counting out loud at two hundred.

- **28 anomalies** drawn from a weighted pool, with repeat-suppression
- **16 milestones** on specific press counts — the deterministic narrative spine
- **17 trophies**, five of which are only awarded to players who poke at things
  that are not the button
- **Zero network calls.** No analytics, no telemetry, no font CDN. Verified in CI
- **Respects `prefers-reduced-motion`** — movement is suppressed, the writing is not

Everything is stored per-device in `localStorage`. Nothing about you leaves the
browser, which is what the footer under the console promises.

## Quick start

Requires **Node 22+** (`.nvmrc` is provided).

```bash
npm ci
npm run dev          # http://localhost:5173
```

| Script              | Does                                                        |
| ------------------- | ----------------------------------------------------------- |
| `npm run dev`       | Vite dev server with HMR                                    |
| `npm run build`     | Type-check, then build one self-contained `dist/index.html` |
| `npm run preview`   | Serve the production build locally                          |
| `npm run typecheck` | `tsc --noEmit`                                              |
| `npm run test`      | Vitest — registry and content-integrity checks              |
| `npm run format`    | Prettier, write mode                                        |
| `npm run verify`    | The full CI gate: format → typecheck → test → build         |

### Deploying

The build emits **a single file**. Drop `dist/` (one HTML file plus the social
preview card) on any static host — GitHub Pages, Netlify, Vercel, S3, or a USB
stick. There is no server, no routing and no environment configuration. You can
also open `dist/index.html` straight off the filesystem.

## How it works

```
press → milestone? ──yes──▶ deterministic story beat
            │
            no
            ▼
        weighted draw ──▶ anomaly.run(Ctx) ──▶ console line · page effect · toast
```

An anomaly is **a plain data record, not a component**:

```ts
{
  id: "small",
  code: "E-09",
  tag: "SHRINK",
  line: "the button is keeping a low profile.",
  weight: 10,
  run(c) {
    c.setBtn({ scale: 0.42 });
    c.say(this.line);
    c.later(() => c.setBtn({ scale: 1 }), 5000);
  },
}
```

Append it to `EVENTS` in [`src/chaos/events.ts`](src/chaos/events.ts) and it is
live — including its row in the field guide. There is no registry to update,
no enum to extend, and no component to write. The test suite then enforces that
your `id` and `code` are unique, that no two anomalies share a log line, and that
any trophy you award actually exists.

Events never touch React. They are handed a `Ctx` toolbox — `say`, `typeText`,
`teleport`, `pulse`, `setCounter`, `ghosts`, `later`, and the set pieces
`loadingSeq` / `voidSeq` / `bsodSeq`. That boundary is what makes the anomaly
system safe to extend: if it is not on `Ctx`, an anomaly cannot do it, and every
timer it schedules is cleaned up on unmount.

Deeper design notes, the persistence and reduced-motion strategy, and why the
button's transform lives on a wrapper element: [**docs/ARCHITECTURE.md**](docs/ARCHITECTURE.md).

## Discovery

There are 28 entries. Here are three, so you know what a discovery looks like in
the guide — the rest are yours to find.

| Code   | Codename | Observed                             |
| ------ | -------- | ------------------------------------ |
| `E-01` | FLEE     | the button fled.                     |
| `E-09` | SHRINK   | the button is keeping a low profile. |
| `E-22` | VOID     | the void said hello back.            |

Press the `GUIDE` button in the header (or press `Escape` to leave) to see which
of the 28 you have personally witnessed, at which press count you first saw it,
and which trophies you are still missing. **Reset all data** is in the guide's
footer and asks twice, because it should.

> Three anomalies are rarer than the rest. One of them is called JACKPOT, and none
> of this is redeemable.

## Tech

| Layer     | Choice                                                                    |
| --------- | ------------------------------------------------------------------------- |
| Framework | React 19 + TypeScript 5.9, strict mode, `noUnusedLocals` on               |
| Build     | Vite 7 with `vite-plugin-singlefile` — the output is one HTML file        |
| Styling   | Tailwind CSS 4 (CSS-first `@theme`), plus hand-written CSS for the button |
| Type      | Archivo and IBM Plex Mono, self-hosted and Latin-subsetted (SIL OFL 1.1)  |
| Audio     | Synthesised with `OscillatorNode` — there are no audio files              |
| Icons     | `lucide-react`                                                            |
| Tests     | Vitest                                                                    |

## Project layout

```
index.html            single empty mount point, no external requests
public/               social preview card
src/
  chaos/              framework-agnostic core: types, data, events, audio
  components/         presentational only — TopBar, Stage, Console, Overlays
  hooks/useChaos.ts   the engine: state, timers, trophies, hidden interactions
  assets/fonts/       vendored woff2 + their OFL licences
tests/                registry and content-integrity tests
tools/                one-off design utilities (social preview generator)
docs/                 architecture notes
```

## Accessibility

The console line and the toasts are `aria-live` regions, so every flavour of
chaos is announced rather than only seen. The button keeps a focus ring, the
guide is closable by `Escape` and by clicking the backdrop, and
`prefers-reduced-motion: reduce` disables shake, invert, mirror and tilt while
leaving the writing — which is the actual game — intact.

## Contributing

Issues and pull requests are welcome. Adding an anomaly takes one file; see
[**CONTRIBUTING.md**](CONTRIBUTING.md) for the event contract, the house style
for copy, and the accessibility rules reviewers will ask about. Run
`npm run verify` before opening a pull request — it is the same gate CI runs.

## Licence

[MIT](LICENSE) for the code. The bundled typefaces remain under the SIL Open Font
License 1.1 — see [`src/assets/fonts/`](src/assets/fonts).

<div align="center">
<sub>You were told not to.</sub>
</div>
