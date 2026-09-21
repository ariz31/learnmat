# 1-D seepage with fixed-head boundaries

This component models steady one-dimensional Darcy flow through a homogeneous soil section.

With positive x from upstream to downstream:

- Head drop: `Δh = h1 − h2`
- Signed hydraulic gradient: `i = Δh/L`
- Darcy flux: `q = k i`
- Cross-sectional area: `A = thickness × width`
- Signed discharge: `Q = q A`

A negative result means flow is opposite the nominal upstream-to-downstream x direction. Equal heads produce zero gradient and zero discharge.

The linear total-head line follows directly from the 1-D constant-k assumptions. It is explicitly **not** a two-dimensional flow net and does not solve anisotropy, layered media, uplift distribution under structures, or free-surface seepage.
