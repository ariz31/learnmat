# Analytical check — centered point-load beam

Default inputs:

- L = 6 m
- P = 20,000 N
- E = 200,000,000,000 Pa
- I = 0.00008 m⁴

Independent closed-form expectations:

- RA = RB = P/2 = 10,000 N
- Mmax = PL/4 = 30,000 N·m
- |vmax| = PL³/(48EI) = 0.005625 m = 5.625 mm
- V left of midspan = +10,000 N
- V right of midspan = -10,000 N

Zero-load invariant: P = 0 must produce zero reactions, zero shear, zero moment, and zero deflection for every sampled x.
