# Review — geo-soil-layers

Reference profile:

- Layer 1: 2.0 m, γnat=17.5, γsat=19.5 kN/m³
- Layer 2: 3.0 m, γnat=18.0, γsat=20.0 kN/m³
- Layer 3: 4.0 m, γnat=19.0, γsat=21.0 kN/m³
- Water table depth = 2.5 m
- Query depth = 5.5 m
- γw = 9.81 kN/m³

Total stress contributions: 2(17.5) + 0.5(18) + 2.5(20) + 0.5(21) = 104.5 kPa.

Pore pressure: u = 9.81(5.5−2.5) = 29.43 kPa.

Effective vertical stress: σ′v = 104.5 − 29.43 = 75.07 kPa.

The source integrates partial layers and splits a layer at the water table when required. Query/water-table depths are constrained to the profile. Live browser/accessibility review remains pending.
