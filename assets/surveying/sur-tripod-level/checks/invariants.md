# Invariants

- Optical-axis origin is (0, instrumentHeight, 0).
- Surveying azimuth is clockwise from north, with north aligned to -Z.
- Unit sight vector is (cos(e) sin(A), sin(e), -cos(e) cos(A)).
- A=0 and e=0 gives (0, 0, -1).
- A=π/2 and e=0 gives (1, 0, 0).
- Plan inset maps east to screen-right and north to screen-up using dx=sin(A), dy=-cos(A).
- Parameter validation occurs before state replacement.
