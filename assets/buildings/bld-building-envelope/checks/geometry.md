# Geometry spot-check

Default parameters:

- width = 18.0 m
- depth = 12.0 m
- floors = 4
- floorHeight = 3.2 m
- bays = 4
- openingWidth = 1.8 m
- openingHeight = 1.5 m
- sillHeight = 0.9 m
- cutaway = 0.36

Independent arithmetic:

- total height = 4 × 3.2 = 12.8 m
- bay width = 18 / 4 = 4.5 m
- maximum permitted opening width = 0.72 × 4.5 = 3.24 m, so 1.8 m passes
- opening top within each storey = 0.9 + 1.5 = 2.4 m
- required maximum opening top = 3.2 - 0.25 = 2.95 m, so 2.4 m passes
- floor elevations = 0.0, 3.2, 6.4, 9.6, 12.8 m
- cutaway display depth = 12 × 0.36 = 4.32 m
- envelope bounds = X [-9, 9] m, Y [0, 12.8] m, Z [-12, 0] m

These are deterministic geometry invariants, not structural or code-compliance checks.
