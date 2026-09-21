# Review — geo-pipe-flow

## Engineering review

Representative case: L = 30 m, D = 0.30 m, Q = 0.08 m³/s, ε = 0.00015 m, ν = 1.004×10⁻⁶ m²/s, g = 9.81 m/s².

- A = π(0.30)²/4 = 0.0706858 m².
- V = 0.08/A = 1.13177 m/s.
- Re ≈ 338,198, so the turbulent explicit branch is appropriate.
- Swamee-Jain gives f ≈ 0.0186.
- h_f ≈ 0.0186(30/0.30)(1.13177²/(2·9.81)) ≈ 0.121 m.

Zero-flow behavior is handled explicitly. Reverse flow changes the direction cue while head-loss magnitude stays non-negative.

## Source/functionality review

Input guards reject non-finite values, non-positive length/diameter/viscosity/gravity, negative roughness, and roughness not smaller than diameter. Runtime methods use absolute time and no autonomous animation loop. No global IDs or shared mutable state are used.

## Accessibility / visual review

The SVG has a descriptive role/label and the demo uses native labelled controls plus a status region. A static repository preview is supplied. Live browser and assistive-technology execution were not available in this session, so those checks remain pending and the asset stays candidate.
