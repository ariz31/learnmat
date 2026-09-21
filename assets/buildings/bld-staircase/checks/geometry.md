# Staircase geometry spot-check

Default inputs:

- total rise = 3.00 m
- risers = 17
- going = 0.280 m
- width = 1.20 m

Convention:

- the upper floor is the terminal walking surface
- therefore a straight flight with 17 risers has 16 horizontal goings

Independent arithmetic:

- riser height = 3.00 / 17 = 0.176470588... m = 176.47 mm
- goings = 17 - 1 = 16
- flight run = 16 × 0.280 = 4.48 m
- geometric pitch = atan2(3.00, 4.48) = 33.80796...°
- physical bounds = X [0, 4.48] m, Y [0, 3.00] m, Z [-1.20, 0] m

Step endpoints:

- first riser: X = 0, Y = 0 to 0.17647 m
- first tread: X = 0 to 0.280 m at Y = 0.17647 m
- sixteenth tread: X = 4.20 to 4.48 m at Y = 2.82353 m
- final seventeenth riser: X = 4.48 m, Y = 2.82353 to 3.00 m

These checks establish geometric consistency only. They do not establish
jurisdiction-specific stair, accessibility, egress, or fire-code compliance.
