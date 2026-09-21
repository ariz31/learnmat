# Simply supported beam response

Status: candidate.

## Learning objective

Connect the centered point load to support reactions, the shear-force diagram, the sagging bending-moment diagram, and the linear-elastic deflected shape.

## Model and assumptions

The model is deliberately bounded to one case:

- simply supported prismatic beam;
- span (L);
- one downward point load (P) at midspan;
- constant (E) and (I);
- small-deflection, linear-elastic Euler-Bernoulli behavior;
- vertical reactions only for the shown vertical loading;
- positive sagging bending moment;
- deflection returned as negative y (downward).

Closed-form checks:

- (R_A = R_B = P/2)
- (V=+P/2) for (0<x<L/2), and (V=-P/2) for (L/2<x<L)
- (M(x)=Px/2) on the left half and (M(x)=P(L-x)/2) on the right half
- (M_{max}=PL/4)
- with (a=min(x,L-x)), (v(x)=-P a(3L^2-4a^2)/(48EI))
- (v_{max}=-PL^3/(48EI)) at midspan

At the point-load location the shear diagram is discontinuous. `responseAt(L/2)` reports shear as zero only as a display convention for the jump; the left and right limits are ±P/2.

The deflected shape is **visually exaggerated** to make curvature legible. Numerical labels and snapshots retain physical SI values.

Default example: (L=6 m), (P=20 kN), (E=200 GPa), (I=8×10^{-5} m^4). This gives reactions 10 kN each, maximum moment 30 kN·m, and maximum downward deflection 5.625 mm.

## Usage

Entrypoint: `demo/index.html`. Reusable module: `src/asset.mjs`.

API parameters are SI:
- `spanM`: 2–20 m
- `loadN`: 0–1,000,000 N
- `elasticModulusPa`: 1–300 GPa in Pa
- `inertiaM4`: (10^{-8})–1 m⁴

The demo converts convenient kN/GPa entries to SI before calling the component. `update(timeSeconds)` is deterministic and time-independent. `snapshot()` returns reactions, extrema, and representative samples.

## Reuse and rights

Original repository contribution under the root MIT license. No external runtime dependency or third-party asset is used.

## Review evidence

See `REVIEW.md`. The checked-in SVG is a representative source-authored preview; browser screenshot, mobile rendering, and assistive-technology execution remain for independent review.

## Change history

- 0.1.0 — Initial centered-point-load beam response component.
