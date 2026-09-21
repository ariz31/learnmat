# Review — geo-pipe-flow 3D replacement

## Engineering

The existing authoritative pipe-flow model and reference calculations are retained. The 3D renderer reads only model outputs; it does not recompute hydraulic results independently. Reversing Q reverses tracer/arrow direction while Darcy–Weisbach loss remains a non-negative dissipative magnitude.

## Spatial 3D / pedagogy

The former flat SVG primary scene has been replaced with actual Three.js geometry: transparent pipe wall, water core, flanges, pressure taps, gauges, flow tracers, flow arrow, head-reference pylons, ground context, perspective camera, lighting, fog, shadows, orbit interaction, step-driven camera framing, and focus/fullscreen presentation. Exact equations and metrics remain 2D overlays complementing the spatial scene.

Tracer velocity and head-pylon displacement are explicitly presentation-scaled so they cannot be mistaken for geometric measurement.

## Runtime

The component requires host Three.js r185 and a host-owned scene. It creates an owned group only, uses host time through update(t), creates no animation loop, and disposes owned geometries/materials idempotently.

## Remaining independent gate

This source replacement was implemented through the repository connector. No browser/WebGL session was available in this execution context to capture a real rendered screenshot or establish pixel-level parity with the surveying references. The asset therefore remains candidate and its spatial/visual evidence is recorded as pending rather than fabricated.
