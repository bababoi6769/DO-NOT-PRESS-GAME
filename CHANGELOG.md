# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] — 2026-09-30

First public release.

### Added

- The button. It is labelled DO NOT PRESS.
- 28 anomalies (`E-01` … `E-28`) dispatched from a weighted random pool with
  repeat-suppression and per-event eligibility gates.
- 16 deterministic milestones that override the random pool on specific presses.
- 17 trophies, including five awarded only for hidden interactions
  (Konami code, right-click, seven title clicks, mouse seismograph, night shift).
- Field guide overlay listing every anomaly and trophy, with per-device discovery
  tracking and a two-step "reset all data" confirmation.
- Two rare full-screen set pieces: the void, and a self-healing system failure.
- Typewriter narration, synthesised sound effects, and a `prefers-reduced-motion`
  path that suppresses shake, invert, mirror and tilt.
- Self-hosted Archivo and IBM Plex Mono (Latin subset), so the game loads with
  **zero third-party network requests**.
- Single-file production build: `dist/index.html` is the entire game.

[Unreleased]: https://github.com/bababoi6769/DO-NOT-PRESS-GAME/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/bababoi6769/DO-NOT-PRESS-GAME/releases/tag/v1.0.0
