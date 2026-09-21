# Surveying Walking Person

Status: in-review component.

## Learning objective

Relate path length, walking speed, elapsed time, and gait phase while providing a reusable field-person primitive for surveying lessons.

## Model and assumptions

- SI units. Runtime coordinates follow LearnMat: +X east/right, +Y up, north along -Z.
- Motion is a straight path from x = 0 to x = pathLength.
- Travel distance is d(t) = min(pathLength, speed × max(t, 0)).
- Arrival time is pathLength / speed when speed > 0; speed = 0 keeps the person at the start.
- Gait phase is 2π × stepFrequency × active walking time and freezes at the endpoint.
- Limb motion is illustrative, not a biomechanical or ergonomic model. The pose is deterministic for fixed inputs and absolute time.
- Height range is 1.4–2.1 m, speed 0–2.5 m/s, path 0.5–50 m, gait frequency 0.5–3 Hz.

## Usage

Open `demo/index.html` in a module-capable browser or import `src/asset.mjs` and call `createAsset(context)`. The host owns the animation clock. Call `update(timeSeconds)` with absolute time, `reset()`, `resize(...)`, and `dispose()`. The component has no network dependencies.

## Reuse and rights

Original repository contribution. No third-party models, textures, fonts, or libraries are embedded. Repository MIT license applies.

## Review evidence

See `REVIEW.md`. The checked-in SVG preview records the default deterministic pose; it is not represented as a browser screenshot.

## Change history

- 0.1.0 — Initial reusable walking-person component.
