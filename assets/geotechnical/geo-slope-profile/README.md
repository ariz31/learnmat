# Slope profile with scoped infinite-slope model

The geometry is defined by slope height H and horizontal run R:

- `β = atan(H/R)`
- `Lslope = sqrt(H²+R²)`

The stability calculation is deliberately limited to a **unit-area planar infinite-slope slice** with soil thickness `z` measured normal to the slope surface. For this defined slice:

- Driving shear stress: `τ = γ z sinβ`
- Total normal stress: `σn = γ z cosβ`
- Pore pressure is parameterized explicitly as `u = r σn`, where `r` is the input ratio `u/σn`
- Effective normal stress: `σ′n = σn − u`
- Shear resistance: `c′ + σ′n tanφ′`
- Model factor of safety: resistance / driving stress

The API uses radians for `φ′`, consistent with the repository runtime contract.

This is **not** a circular-slip search, Bishop/Janbu/Spencer analysis, finite-element model, rainfall infiltration analysis, or code-specific design check. The displayed FS is only the result of the stated simplified planar model and is not labeled safe/unsafe.
