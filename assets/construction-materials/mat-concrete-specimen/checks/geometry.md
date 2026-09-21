# Geometry checks — mat-concrete-specimen

These checks are independent arithmetic targets for review. They are intentionally lightweight; this asset does not add a unit/integration/E2E suite.

## Default cylinder

Inputs:

- diameter = 0.15 m
- radius = 0.075 m
- height = 0.30 m

Expected:

- volume = π × 0.075² × 0.30 = **0.005301437602932776 m³**
- volume = **5.301437602932776 L**
- total surface area = 2π × 0.075 × (0.30 + 0.075) = **0.17671458676442586 m²**
- bounding box min = (-0.075, 0, -0.075) m
- bounding box max = (0.075, 0.30, 0.075) m

## Default cube

Inputs:

- side = 0.15 m

Expected:

- volume = 0.15³ = **0.003375 m³**
- volume = **3.375 L**
- total surface area = 6 × 0.15² = **0.135 m²**
- bounding box min = (-0.075, 0, -0.075) m
- bounding box max = (0.075, 0.15, 0.075) m

## Invariants

1. All accepted dimensions are finite and inside the documented ranges.
2. Cylinder volume is monotonic in positive diameter and height.
3. Cube volume is monotonic in positive side length.
4. Dimension labels and snapshot geometry use the same parameter state.
5. Surface marks never change computed geometry or imply measured aggregate properties.
6. Identical seed + parameters produce identical decorative point positions.
7. Invalid partial updates are rejected before state mutation.
