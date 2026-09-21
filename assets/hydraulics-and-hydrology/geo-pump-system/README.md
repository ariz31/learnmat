# Pump and system operating point

This component uses two explicit learning curves:

- Pump curve: `H_p(Q) = H0 − kp Q²`
- System curve: `H_s(Q) = Hstatic + Ks Q²`

When `H0 ≥ Hstatic`, the non-negative analytical intersection is

`Q* = sqrt((H0 − Hstatic)/(kp + Ks))`

and `H* = H_p(Q*) = H_s(Q*)`.

Hydraulic power is `ρgQ*H*`. Estimated shaft input is `P_hydraulic/η`. The efficiency is a user-supplied constant for this simplified asset; no manufacturer efficiency map is implied.

If shutoff head is below static head, the component states that no non-negative curve intersection exists rather than fabricating an operating point.
