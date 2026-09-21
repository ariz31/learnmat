# Geometry check — bolted shear plate

Default values:

- plate width = 0.14 m
- plate height = 0.34 m
- bolt count = 4
- bolt spacing = 0.075 m
- bolt diameter = 0.020 m
- requested minimum edge distance = 0.045 m

Bolt-group length:

`(4 - 1) * 0.075 = 0.225 m`.

Because the vertical bolt line is centered in the plate:

`actual vertical edge distance = (0.34 - 0.225)/2 = 0.0575 m = 57.5 mm`.

Centered horizontal bolt line gives:

`actual horizontal edge distance = 0.14/2 = 0.070 m = 70 mm`.

Both are at least the requested 45 mm minimum. Bolt spacing 75 mm also exceeds bolt diameter 20 mm.

These are geometric fit checks only. They are not code-prescribed minimum distances and do not evaluate bolt shear, bearing, tear-out, block shear, welds, slip, prying, plate yielding, or any design strength.
