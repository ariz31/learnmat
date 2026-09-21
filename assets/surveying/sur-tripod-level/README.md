# Surveying Tripod and Level

Status: in-review component.

## Learning objective

Make instrument height, tripod spread, sight elevation, and surveying azimuth explicit in a reusable level-instrument visual.

## Model and assumptions

- SI units and LearnMat coordinates: +X east/right, +Y up, north along -Z.
- Instrument optical-axis origin is at (0, instrumentHeight, 0).
- Surveying azimuth A is clockwise from north.
- With sight elevation e, the unit sight vector is (cos(e) sin(A), sin(e), -cos(e) cos(A)).
- A=0 points north (0,0,-1); A=90° points east (+1,0,0).
- Instrument height range is 1.0–2.2 m; tripod spread 0.4–1.2 m; sight elevation ±5°.
- The elevation drawing is a schematic projection. Azimuth is shown separately in the plan inset to avoid implying that a 2D side view carries full plan orientation.

## Usage

Import `src/asset.mjs`, call `createAsset(context)`, then use `setParameters`, absolute-time `update`, `reset`, `resize`, `snapshot`, and idempotent `dispose`. No network dependency is required.

## Reuse and rights

Original repository contribution under the repository MIT license. No third-party models, textures, fonts, or libraries are embedded.

## Review evidence

See `REVIEW.md`. The checked-in SVG preview is a deterministic source-authored default view, not a claimed browser screenshot.

## Change history

- 0.1.0 — Initial tripod-and-level component with explicit instrument height and line-of-sight vector.
