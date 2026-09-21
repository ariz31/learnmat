# Analytical check — symmetric triangular truss

Default inputs:

- span L = 8 m
- rise h = 3 m
- apex load P = 40,000 N downward

Geometry gives a 3-4-5 half-triangle, so sin(theta)=3/5=0.6 and tan(theta)=3/4=0.75.

Independent joint-equilibrium expectations:

- RAy = RCy = P/2 = 20,000 N
- diagonal compression magnitude = P/(2 sin(theta)) = 33,333.333... N
- bottom-chord tension = P/(2 tan(theta)) = 26,666.666... N
- with positive axial force defined as tension: AB = BC = -33,333.333... N and AC = +26,666.666... N

Zero-load invariant: P = 0 must return zero reactions and zero member axial forces.
