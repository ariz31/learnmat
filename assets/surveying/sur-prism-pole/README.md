# Prism Pole Carrier

Status: in-review component.

## Learning objective

Show the prism center, target height, plumb reference, and pole verticality error in one reusable surveying-field actor.

## Model and assumptions

- SI units; +Y is vertical and +X is the side-view horizontal axis.
- The pole base remains fixed at the surveyed ground point.
- `targetHeight` is the distance from the pole base to the prism center measured along the pole.
- Positive `poleTiltRad` leans the pole toward +X.
- Prism-center coordinates are:
  - x = targetHeight × sin(tilt)
  - y = targetHeight × cos(tilt)
- Tilt range is ±10° and target height is 1.0–3.5 m.
- The carrier pose and optional breathing motion are illustrative. The pole/prism geometry and numeric outputs are authoritative.

## Usage

Import `src/asset.mjs`, create the asset with a DOM container, and use `setParameters`, absolute-time `update`, `reset`, `resize`, `snapshot`, and idempotent `dispose`. The asset has no network dependencies.

## Reuse and rights

Original repository contribution under MIT. No third-party models, textures, fonts, or runtime libraries are embedded.

## Review evidence

See `REVIEW.md`. The checked-in SVG preview is a deterministic source-authored view and is not described as a browser screenshot.

## Change history

- 0.1.0 — Initial prism-pole carrier with target-height and verticality geometry.
