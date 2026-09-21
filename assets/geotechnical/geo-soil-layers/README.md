# Layered soil profile and effective stress

This asset evaluates one-dimensional vertical geostatic stress through three layers.

For each layer interval above the water table, it uses the stated natural/bulk unit weight. For each interval below the water table, it uses the stated saturated unit weight. Total vertical stress is the sum of `γ Δz` contributions.

Hydrostatic pore-water pressure is

`u = γw max(0, z − zWT)`

and effective vertical stress is

`σ′v = σv − u`.

The model deliberately omits capillary suction, surcharge, lateral earth pressure, consolidation history, and excess pore pressure. Unit weights are user-provided learning inputs, not material defaults for design.
