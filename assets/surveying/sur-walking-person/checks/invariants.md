# Invariants

- Straight-path distance: d(t) = min(L, v·max(t,0)).
- Default L=10 m and v=1.2 m/s gives arrival time 8.333333333 s.
- At t=5 s, distance = 6.0 m and path fraction = 0.6.
- At v=0, distance and gait phase remain zero for all t.
- At t greater than arrival, position remains exactly at L and gait phase is sampled at arrival time, preventing endpoint foot cycling.
- Parameter validation occurs before replacing live state.
