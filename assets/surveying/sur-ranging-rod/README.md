# Ranging Rod Alignment

Status: in-review component.

## Learning objective

Show the straight observer–target survey line, an intermediate ranging rod, and the rod's perpendicular cross-track offset from that line.

## Model and assumptions

- LearnMat coordinates are used: +X east/right, +Y up, north along -Z.
- Observer: (0, 0, 0).
- Distant target: (0, 0, -sightDistance).
- Intermediate rod base: (crossTrackOffset, 0, -rodStationDistance).
- Because the reference line lies on x=0, cross-track error is `abs(crossTrackOffset)`.
- The rod is considered aligned when `crossTrackError <= alignmentTolerance`.
- `rodStationDistance` must be less than `sightDistance`.
- The plan view is the authoritative alignment view. The elevation inset communicates rod verticality/height but does not alter plan alignment.

## Usage

Import `src/asset.mjs`, call `createAsset(context)`, and use `setParameters`, absolute-time `update`, `reset`, `resize`, `snapshot`, and idempotent `dispose`. No network dependency is required.

## Reuse and rights

Original repository contribution under MIT. No third-party models, textures, fonts, or runtime libraries are embedded.

## Review evidence

See `REVIEW.md`. The checked-in SVG preview is deterministic source-authored evidence, not a browser-screenshot claim.

## Change history

- 0.1.0 — Initial ranging-rod alignment component with explicit cross-track error and tolerance.
