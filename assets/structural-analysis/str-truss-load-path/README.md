# Triangular truss load path

Status: candidate.

## Learning objective

Trace a centered vertical joint load through a simple symmetric triangular truss and distinguish compression in the two inclined members from tension in the bottom chord.

## Model and assumptions

Physical joints:
- A = (0, 0), pin support
- B = (L/2, h), loaded apex
- C = (L, 0), horizontal-surface roller

Members are AB, BC, and AC. The structure is treated as an ideal pin-jointed planar truss with loads applied only at joints, negligible member self-weight, symmetric geometry, and no support settlement.

For downward apex load (P):

- (R_{Ay}=R_{Cy}=P/2)
- (R_{Ax}=0)
- (	heta=atan2(h,L/2))
- inclined-member compression magnitude (C=P/(2 sin	heta))
- bottom-chord tension (T=P/(2 tan	heta))

The runtime snapshot uses the structural-analysis sign convention **positive axial force = tension**, so AB and BC are (-C) and AC is (+T).

Default example: (L=8 m), (h=3 m), (P=40 kN). Then (	heta≈36.87°), vertical reactions are 20 kN each, AB=BC≈33.333 kN compression, and AC≈26.667 kN tension.

This is a pedagogical determinate truss case, not a general truss solver or design-code check.

## Usage

Entrypoint: `demo/index.html`. Reusable module: `src/asset.mjs`.

SI parameters:
- `spanM`: 2–30 m
- `riseM`: 0.5–15 m
- `loadN`: 0–1,000,000 N

The component implements runtime v1. `snapshot()` returns physical joint coordinates, reactions, member axial forces, and the diagonal angle. `update(timeSeconds)` is deterministic and time-independent.

## Reuse and rights

Original repository contribution under the root MIT license. No third-party runtime dependency or external visual asset is used.

## Review evidence

See `REVIEW.md`. The preview is source-authored from the default analytical case; live browser screenshot and assistive-technology execution remain for independent review.

## Change history

- 0.1.0 — Initial symmetric triangular-truss load-path component.
