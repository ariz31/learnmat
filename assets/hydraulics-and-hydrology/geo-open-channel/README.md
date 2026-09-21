# Open-channel section hydraulics

Rectangular-channel learning component using explicit SI inputs.

## Model

- Area: `A = by`
- Wetted perimeter: `P = b + 2y`
- Hydraulic radius: `R = A/P`
- Mean velocity: `V = Q/A`
- Hydraulic depth for a rectangular channel: `D_h = A/T = y`
- Froude number: `Fr = V/√(gD_h)`
- Specific energy: `E = y + V²/(2g)`
- Manning capacity at the supplied depth: `Q_M = (1/n)AR^(2/3)S^(1/2)`

The component does **not** solve normal depth. It compares the supplied discharge to the Manning uniform-flow capacity associated with the supplied depth, roughness, and slope. This distinction is displayed directly in the visualization.

No third-party runtime or network access is required.
