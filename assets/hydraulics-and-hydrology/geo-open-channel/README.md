# Open-channel flow — surveying-grade 3D rebuild

The analytical rectangular-channel model remains authoritative. The former SVG-primary renderer is replaced with a real host-scene Three.js channel: concrete floor and sidewalls, transparent water prism, depth staff, downstream arrow, moving tracer lanes, ground context, and an explicitly exaggerated longitudinal bed-slope cue.

The demo follows four compact teaching steps: section geometry, continuity/velocity, Froude regime, and specified-depth Manning capacity. It provides camera presets, OrbitControls, soft lighting/shadows, play/pause/reset, responsive metrics, and focus/fullscreen presentation.

The longitudinal scene length, tracer speed, and slope cue are visual aids. Exact width, depth, velocity, Froude number and Manning capacity come from `src/model.mjs`. The asset still does **not** claim to solve normal depth.
