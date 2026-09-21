# Geometry checks — mat-masonry-units

Default inputs:

- L = 0.40 m
- H = 0.20 m
- D = 0.15 m
- n = 2
- void length = 0.12 m
- void depth = 0.09 m

Expected:

- gross volume = 0.40 × 0.20 × 0.15 = **0.0120 m³**
- one void volume = 0.12 × 0.09 × 0.20 = **0.00216 m³**
- total void volume = 2 × 0.00216 = **0.00432 m³**
- idealized solid volume = 0.0120 - 0.00432 = **0.00768 m³**
- gross top area = 0.40 × 0.15 = **0.0600 m²**
- total void top area = 2 × 0.12 × 0.09 = **0.0216 m²**
- net top area = **0.0384 m²**

Invariants:

1. Void depth is less than unit depth.
2. Combined void length leaves visible webs and end shells.
3. `V_solid > 0`.
4. Bond view changes presentation only, not geometric volume.
5. Mortar-joint value changes schematic spacing only.
6. No standard designation, capacity, fire rating, reinforcement rule, or code claim is inferred.
