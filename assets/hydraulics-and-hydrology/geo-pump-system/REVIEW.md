# Review — geo-pump-system

Reference case: H0=36 m, kp=800, Hstatic=8 m, Ks=1200, η=0.75, ρ=1000 kg/m³, g=9.81 m/s².

- Q* = √(28/2000) = 0.1183216 m³/s.
- H* = 36 − 800(0.1183216)² = 24.8 m.
- Hydraulic power = ρgQH ≈ 28.786 kW.
- Estimated shaft power = 28.786/0.75 ≈ 38.382 kW.

Both curve equations give the same operating head by construction. The no-intersection case H0 < Hstatic is explicitly represented. This quadratic pump curve is an educational idealization and is not presented as manufacturer data.

Runtime review found finite-input guards, no autonomous animation loop, isolated state, deterministic output, and idempotent disposal. Live browser and assistive-technology review remain pending.
