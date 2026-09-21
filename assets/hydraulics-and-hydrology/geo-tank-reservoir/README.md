# Tank / reservoir storage

Constant-area storage component using the integral form of a simple continuity balance.

For an unconstrained tank, `A dh/dt = Qin − Qout`, so `h(t) = h0 + (Qin − Qout)t/A` for constant flows. The component then enforces the physical bounds `0 ≤ h ≤ hmax`.

At the upper bound, positive net inflow becomes overflow. At the lower bound, requested outlet flow that cannot be supplied is reported as an outlet shortfall; actual outlet flow is reduced accordingly. This keeps the reported storage state physically bounded and makes the boundary condition explicit.

Inputs use SI units. `update(t)` samples absolute time directly, so backward seeks are deterministic and do not accumulate numerical integration error.
