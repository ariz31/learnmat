# Shallow footing contact-pressure interaction

For a rectangular rigid footing of width B and out-of-plane length L under vertical load P and moment M about the length axis:

- Area `A = BL`
- Average pressure `qavg = P/A`
- Eccentricity `e = M/P`
- Edge pressures under the **linear full-contact assumption**:
  `q = P/(BL) ± 6M/(LB²)`

The middle-third condition `|e| ≤ B/6` is equivalent to non-negative pressure across the full base for this model.

If the computed minimum pressure is negative, the component explicitly flags the full-contact solution as invalid for soil contact. It does **not** silently truncate the pressure diagram or claim to solve the no-tension redistributed contact problem.

The asset does not calculate bearing capacity, settlement, punching shear, footing reinforcement, or code-compliance capacity.
