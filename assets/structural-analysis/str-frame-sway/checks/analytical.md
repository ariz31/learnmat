# Geometry check — prescribed portal-frame sway

Default values:

- bay width = 6 m
- story height = 3.5 m
- drift ratio = 0.015
- display exaggeration = 3

Expected true top translation:

`deltaX = driftRatio * storyHeight = 0.015 * 3.5 = 0.0525 m = 52.5 mm`.

Boundary-condition invariants:

- fixed base joint A remains (0, 0);
- fixed base joint B remains (6, 0);
- top joints C and D translate by the same true deltaX;
- top beam therefore remains horizontal;
- drift ratio 0 produces zero true translation.

Display exaggeration changes only rendered displacement, never snapshot geometry or the stated true displacement.
