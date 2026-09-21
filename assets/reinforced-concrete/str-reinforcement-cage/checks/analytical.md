# Geometry check — reinforcement cage

Default section:

- width = depth = 0.45 m
- clear cover = 0.04 m to **outside of tie**
- tie diameter = 0.01 m
- longitudinal bar diameter = 0.02 m
- 3 bars along each width face and 3 along each depth face

Tie centerline inset:

`0.04 + 0.01/2 = 0.045 m`.

Longitudinal-bar centerline inset:

`0.04 + 0.01 + 0.02/2 = 0.060 m`.

Perimeter longitudinal-bar count avoids duplicated corners:

`2*barsAlongWidth + 2*(barsAlongDepth-2) = 2*3 + 2*1 = 8 bars`.

For 3.0 m height, tie centerlines begin at 0.045 m and end at 2.955 m, giving 2.91 m available. With requested maximum spacing 0.20 m:

`intervalCount = ceil(2.91/0.20) = 15`

`actual spacing = 2.91/15 = 0.194 m = 194 mm`

Therefore actual spacing is not greater than the requested maximum.

This is a geometry invariant only; no minimum reinforcement ratio, confinement, seismic detailing, development length, splice, or code requirement is evaluated.
