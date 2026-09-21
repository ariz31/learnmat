# Review — geo-seepage-section

Reference case: L=12 m, thickness=4 m, width=1 m, k=2×10⁻⁵ m/s, h1=8 m, h2=3 m.

- Δh = 5 m.
- i = 5/12 = 0.4166667.
- Darcy flux q = ki = 8.33333×10⁻⁶ m/s.
- Area A = 4 m².
- Discharge Q = qA = 3.33333×10⁻⁵ m³/s.
- Linear midpoint total head = (8+3)/2 = 5.5 m.

Reversing the boundary heads reverses the signed gradient and discharge. Equal heads yield exactly zero flow. The visual states that this is a 1-D section and does not depict a solved 2-D flow net.

Runtime source review found finite input guards, positive geometry/k requirements, isolated state, and idempotent disposal. Live browser/accessibility review remains pending.
