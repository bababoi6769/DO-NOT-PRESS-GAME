## What changed

<!-- One paragraph. What does the player experience differently after this? -->

## Type

- [ ] New anomaly (`src/chaos/events.ts`)
- [ ] New trophy (`src/chaos/data.ts`)
- [ ] New milestone
- [ ] New hidden interaction
- [ ] Fix
- [ ] Tooling / docs / chore

## Checklist

- [ ] `npm run verify` passes locally (format → typecheck → test → build)
- [ ] Anomaly `id` and `code` are unique, and `code` is appended in ascending order
- [ ] The log line is unique, lowercase, and reads like a log entry rather than a caption
- [ ] Any new `c.unlock("id")` target exists in `ACHIEVEMENTS` and is reachable
- [ ] New timed effects respect `ctx.calm` (`prefers-reduced-motion`)
- [ ] New UI is keyboard reachable and announced by a screen reader
- [ ] No new runtime network requests — this project makes none

## Notes for the reviewer

<!-- Anything you deliberately left out, or a judgement call worth a second opinion. -->
