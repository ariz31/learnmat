# Surveying Tape Team

Status: in-review component.

## Learning objective

Show two-person tape handling while separating the horizontal endpoint span from the longer curved tape length produced by sag.

## Model and assumptions

- SI units; +X is along the measured line, +Y is up.
- Both tape endpoints are held at equal elevation `supportHeight`.
- Straight mode is the reference chord of length `horizontalSpan`.
- Sag mode uses a symmetric catenary under tape self-weight:
  - weight per unit length: `w = massPerLength × g`
  - catenary parameter: `a = horizontalTension / w`
  - sag: `f = a[cosh(L/(2a)) - 1]`
  - curved tape length: `S = 2a sinh(L/(2a))`
- The model assumes uniform tape mass and constant horizontal tension; elastic stretch, temperature, slope, support-height difference, and wind are outside this component.
- The displayed sag is visually magnified when necessary so small field sag remains legible. Numeric outputs retain physical SI values.

## Usage

Import `src/asset.mjs` and call `createAsset(context)`. The reusable component has no autonomous animation loop. Use `setParameters`, absolute-time `update`, `reset`, `resize`, `snapshot`, and idempotent `dispose`.

## Reuse and rights

Original repository contribution under MIT. No third-party models, textures, fonts, or runtime libraries are embedded.

## Review evidence

See `REVIEW.md`. The SVG preview is deterministic source-authored evidence, not a claimed browser screenshot.

## Change history

- 0.1.0 — Initial two-person tape-handling and catenary-sag component.
