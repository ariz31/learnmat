# Analytical check — support restraints

This is a topology/constraint check rather than a force calculation.

Expected planar restrained degrees of freedom and possible reactions:

| Support | Restrained DOF | Possible reactions |
| --- | --- | --- |
| Pin | x, y | Rx, Ry |
| Horizontal roller | y | Ry |
| Fixed | x, y, rz | Rx, Ry, Mz |

The component model returns exactly these mappings. The reaction arrows are symbolic positive components only; no magnitude or actual solved sign is implied.
