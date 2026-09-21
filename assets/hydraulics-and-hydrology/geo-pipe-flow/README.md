# Pipe flow — surveying-grade 3D rebuild

This replacement keeps the validated continuity/Reynolds/Darcy–Weisbach model in `src/model.mjs` and replaces the old SVG-primary renderer with a real host-scene Three.js component.

## 3D teaching scene

The reusable component contributes a recognizable transparent pipe run with a visible water core, flange rings, pressure taps/gauges, flow-direction arrow, animated internal tracers, and two head-reference pylons. The demo supplies a deliberate camera, soft shadows, atmospheric depth, step navigation, restrained metrics, OrbitControls, play/pause/reset, and focus/fullscreen presentation.

The tracer speed and head-pylon vertical separation are **display-scaled** for teaching. Numerical velocity and head loss always come from the analytical model and are exposed in the snapshot/HUD.

## Educational sequence

1. Continuity: Q = AV.
2. Flow regime: Re = |V|D/ν.
3. Friction factor and Darcy–Weisbach loss.
4. Direction/reversal and energy-loss interpretation.

Three.js is a declared peer/runtime dependency at version 0.185.1. The reusable component never creates its own renderer, camera, or requestAnimationFrame loop; the demo/host owns those resources as required by runtime v1.
