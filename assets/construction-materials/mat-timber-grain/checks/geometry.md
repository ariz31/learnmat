# Geometry and orientation checks — mat-timber-grain

These are independent arithmetic targets for focused review. No unit/integration/E2E suite is added.

## Default specimen

Inputs:

- length = 0.300 m
- width = 0.075 m
- thickness = 0.025 m
- θ = 8° = 0.13962634015954636 rad

Expected geometric volume:

- V = 0.300 × 0.075 × 0.025
- V = **0.0005625 m³**
- V = **562.5 cm³**

Expected grain-direction unit vector:

- x = cos(8°) = **0.9902680687**
- y = **0**
- z = -sin(8°) = **-0.1391731010**

Norm check:

- sqrt(x² + y² + z²) = **1.0** within floating-point precision

## Zero-angle check

For θ = 0:

- expected grain direction = **(1, 0, 0)**
- grain lines align with the specimen +X longitudinal axis

## Sign check

For a positive θ:

- the model z-component is negative
- the displayed grain arrow rotates from +X toward the page direction representing -Z

For a negative θ:

- the model z-component is positive
- the displayed arrow rotates oppositely

## Invariants

1. API grain angle is radians, never degrees.
2. Demo degree input is converted to radians before calling the component.
3. Grain density changes only the count/appearance of illustrative lines.
4. Identical seed + parameter state produces identical grain-line placement.
5. Geometry and volume are independent of decorative grain density.
6. The component makes no species, defect-grade, L/R/T anatomy, strength, or code claim.
7. Invalid partial updates are rejected before component state mutation.
