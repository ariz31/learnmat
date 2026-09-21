# Geometry checks — mat-asphalt-layers

Default layer thicknesses:

- top = 0.040 m
- middle = 0.060 m
- bottom = 0.080 m
- total = **0.180 m**

Default slab:

- length = 0.400 m
- width = 0.300 m
- plan area = **0.120 m²**

Expected layer volumes:

- top = 0.120 × 0.040 = **0.0048 m³ = 4.80 L**
- middle = 0.120 × 0.060 = **0.0072 m³ = 7.20 L**
- bottom = 0.120 × 0.080 = **0.0096 m³ = 9.60 L**
- sum = **0.0216 m³ = 21.60 L**

Default core:

- diameter = 0.100 m
- radius = 0.050 m
- area = π × 0.050² = **0.007853981633974483 m²**
- total volume = area × 0.180 = **0.001413716694115407 m³ = 1.413716694 L**

Thickness fractions:

- top = **22.2222%**
- middle = **33.3333%**
- bottom = **44.4444%**
- sum = **100%**

Invariants:

1. Layer thickness sum equals total thickness.
2. Layer-volume sum equals sample total volume for either view.
3. Changing view changes cross-sectional area used for volume, not layer thicknesses.
4. Texture and dimensions toggles never alter geometry.
5. No pavement-design or asphalt-mixture property is inferred from thickness alone.
