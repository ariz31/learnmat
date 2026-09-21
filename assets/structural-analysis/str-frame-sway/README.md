# Portal frame lateral sway

Status: candidate.

## Learning objective

Relate story drift ratio to top translation and visualize the corresponding sway geometry of a single-bay portal frame.

## Model and assumptions

The component is intentionally a **kinematic visualization**, not a structural stiffness solver.

- Bases A and B are fixed against translation/rotation.
- The top beam is treated as rigid for the prescribed sway shape and remains horizontal.
- Both top joints translate by `deltaX = driftRatio × storyHeightM`.
- No member stiffness, load, reaction, moment, P-delta effect, code drift limit, or strength check is inferred.
- Rendering may exaggerate the displacement; physical snapshot coordinates always retain the true prescribed translation.

Default: story height 3.5 m and drift ratio 0.015 give a true lateral translation of 0.0525 m = 52.5 mm.

## Usage

Use `demo/index.html` or import `src/asset.mjs`. Parameters are `bayWidthM`, `storyHeightM`, `driftRatio`, and display-only `exaggeration`.

The runtime implements parameter validation, deterministic update sampling, reset, resize, serializable snapshot, and idempotent disposal.

## Reuse and rights

Original repository contribution under the root MIT license. No external runtime dependencies or third-party assets.

## Review evidence

See `REVIEW.md` and `checks/analytical.md`. Live browser screenshot and assistive-technology execution remain for independent review.

## Change history

- 0.1.0 — Initial prescribed-drift portal-frame sway component.
