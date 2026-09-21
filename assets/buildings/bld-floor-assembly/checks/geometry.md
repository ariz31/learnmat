# Floor assembly geometry spot-check

Default values:

- ceiling board = 0.012 m
- service void = 0.300 m
- slab geometry = 0.150 m
- screed / bedding = 0.040 m
- floor finish = 0.012 m
- exploded display gap = 0.080 m

Independent arithmetic:

- physical build-up = 0.012 + 0.300 + 0.150 + 0.040 + 0.012 = 0.514 m
- solid thickness = 0.012 + 0.150 + 0.040 + 0.012 = 0.214 m
- service void is 0.300 m and is excluded from solid thickness
- four exploded inter-layer gaps at 0.080 m add 0.320 m of display separation only
- physical bounds remain Y [0, 0.514] m regardless of exploded spacing
- plan bounds at default size are X [-3, 3] m and Z [-4, 0] m

Layer physical elevations from bottom:

- ceiling board: 0.000 to 0.012 m
- service void: 0.012 to 0.312 m
- slab geometry: 0.312 to 0.462 m
- screed / bedding: 0.462 to 0.502 m
- floor finish: 0.502 to 0.514 m

These checks verify geometry only. They do not establish structural, fire, acoustic,
thermal, accessibility, or building-code performance.
