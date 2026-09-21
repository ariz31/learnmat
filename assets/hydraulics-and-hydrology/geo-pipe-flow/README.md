# Pipe flow

Reusable dependency-free SVG component for continuity and Darcy-Weisbach head loss.

## Model

- Area: `A = πD²/4`
- Mean velocity: `V = Q/A`
- Reynolds number: `Re = |V|D/ν`
- Laminar friction factor: `f = 64/Re`
- For `Re ≥ 2300`, the component uses the Swamee-Jain explicit approximation as a learning visualization.
- Darcy-Weisbach loss magnitude: `h_f = f(L/D)V²/(2g)`.

The loss is always reported as a positive dissipative magnitude; flow direction is shown separately. At exactly zero flow, velocity, Reynolds number, friction factor, and head loss are zero. Transitional flow is explicitly labelled as an approximation rather than a solved turbulent state.

## Runtime

Import `src/asset.mjs` and call `createAsset(context)`. Inputs are SI and documented in `component.json`. No network access or third-party runtime is required. `update(t)` changes only the display phase of the flow cue and is deterministic in absolute time.

Setters, reset, resize, update, and snapshot throw after disposal; `dispose()` itself is idempotent.
