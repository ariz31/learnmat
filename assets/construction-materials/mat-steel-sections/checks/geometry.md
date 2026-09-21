# Geometry checks — mat-steel-sections

These are independent arithmetic targets for focused review. No unit/integration/E2E suite is added.

## Default I-section

Inputs:

- d = 0.300 m
- b = 0.150 m
- tw = 0.008 m
- tf = 0.012 m

Expected:

- flange contribution = 2 × 0.150 × 0.012 = **0.003600 m²**
- web contribution = (0.300 - 2 × 0.012) × 0.008 = **0.002208 m²**
- total area = **0.005808 m² = 5808 mm²**
- bounding box = **0.150 m × 0.300 m**

## Default channel

With the same d, b, tw, and tf, the idealized non-overlapping rectangles have the same gross geometric area:

- total area = **0.005808 m² = 5808 mm²**
- bounding box = **0.150 m × 0.300 m**

This equality is a result of the simplified generic dimensions, not a statement that real I-sections and channels with matching nominal dimensions have identical standardized area.

## Default angle

Inputs:

- Lx = 0.100 m
- Ly = 0.100 m
- t = 0.010 m

Expected:

- area = 0.010 × (0.100 + 0.100 - 0.010)
- total area = **0.001900 m² = 1900 mm²**
- bounding box = **0.100 m × 0.100 m**

## Invariants

1. All accepted dimensions are finite and within documented bounds.
2. Two flange thicknesses remain less than overall depth.
3. Web thickness remains less than flange width.
4. Angle thickness remains less than both legs.
5. Dimension labels and computed area use one validated parameter state.
6. Geometry contains no fabricated standard designation, grade, capacity, or code claim.
7. Invalid partial updates are rejected before component state mutation.
