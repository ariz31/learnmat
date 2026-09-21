# Leveling Staff Holder

Status: in-review component.

## Learning objective

Use a reusable surveying actor to show a leveling staff at a field point and make verticality error explicit rather than visually ambiguous.

## Model and assumptions

- SI units and LearnMat right-handed coordinates: +X east/right, +Y up, north along -Z.
- Staff base is fixed at the local origin.
- Positive `staffTiltRad` leans the staff toward +X.
- Staff top offset is x = H sin(θ); vertical projection is y = H cos(θ).
- `readingHeight` is measured from the staff base along the graduated staff and cannot exceed staff height.
- Staff height range: 2–5 m. Tilt range: ±5°. Person height: 1.4–2.1 m.
- The person geometry and small breathing motion are illustrative; the staff geometry is authoritative.

## Usage

Import `src/asset.mjs`, call `createAsset(context)`, then use `setParameters`, absolute-time `update`, `reset`, `resize`, `snapshot`, and idempotent `dispose`. No network dependency is required.

## Reuse and rights

Original repository contribution under the repository MIT license. No third-party models, textures, fonts, or libraries are embedded.

## Review evidence

See `REVIEW.md`. The SVG preview is a deterministic source-authored default view, not a claimed browser screenshot.

## Change history

- 0.1.0 — Initial leveling-staff holder with explicit tilt geometry.
