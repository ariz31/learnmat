# Review — geo-slope-profile

Reference case: H=6 m, run=9 m, normal thickness z=1.5 m, γ=18 kN/m³, c′=5 kPa, φ′=32° = 0.55850536 rad, pore-pressure ratio u/σn=0.20.

- β = atan(6/9) = 33.6901°.
- Slope length = √(6²+9²) = 10.8167 m.
- Driving τ = 18(1.5)sinβ = 14.9769 kPa.
- Total σn = 18(1.5)cosβ = 22.4654 kPa.
- u = 0.20σn = 4.4931 kPa.
- Effective σ′n = 17.9723 kPa.
- Resistance = 5 + 17.9723 tan32° ≈ 16.2303 kPa.
- Simplified planar FS ≈ 1.08369.

The component does not map this value to a safety verdict and explicitly states that it is not a circular-slip/general limit-equilibrium analysis. Live browser/accessibility review remains pending.
