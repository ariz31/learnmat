# Grading checks — mat-aggregate-grading

Default balanced percent passing, descending sieve openings:

`100, 95, 85, 68, 55, 33, 20, 12, 7, 4, 2`

Expected percent retained:

- 37.5 mm: 0%
- 25 mm: 5%
- 19 mm: 10%
- 12.5 mm: 17%
- 9.5 mm: 13%
- 4.75 mm: 22%
- 2.36 mm: 13%
- 1.18 mm: 8%
- 0.60 mm: 5%
- 0.30 mm: 3%
- 0.15 mm: 2%
- pan: 2%

Sum = **100%**.

For a 5.00 kg sample:

- largest retained interval = 22% at the 4.75 mm sieve interval
- retained mass for that interval = **1.10 kg**
- pan mass = **0.10 kg**
- total retained mass = **5.00 kg**

Invariants:

1. Every percent passing is in [0,100].
2. Percent passing never increases as opening decreases.
3. Retained percentages including pan sum to 100%.
4. Retained masses including pan sum to sample mass.
5. Particle symbols never influence grading calculations.
6. Presets are illustrative and are not specification envelopes.
