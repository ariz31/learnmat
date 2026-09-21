# Invariants

- `w = massPerLength × 9.80665` N/m.
- In sag mode, `a = horizontalTension / w`.
- Equal-height endpoint sag is `a(cosh(L/(2a)) - 1)`.
- Curved tape length is `2a sinh(L/(2a))` and must be greater than or equal to the horizontal span.
- In straight mode, sag is exactly zero and curve length equals horizontal span.
- Increasing horizontal tension with all other inputs fixed reduces sag.
- Parameter validation occurs before replacing the live state.
