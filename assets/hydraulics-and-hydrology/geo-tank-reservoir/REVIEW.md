# Review — geo-tank-reservoir 3D replacement

The validated mass-balance and storage-bound model is retained. The Three.js component visualizes model-computed level, actual outlet, overflow and outlet shortfall without performing a second calculation path.

The former flat representation is replaced by recognizable storage geometry with tank shell, water volume, pipe routing, flow tracers, lighting/shadow-compatible materials, perspective camera presets, instructional steps and focus mode. Time acceleration is a demo-layer presentation choice and is disclosed.

Runtime v1 ownership is preserved: host supplies Three.js, scene, camera/renderer/time loop; the component contributes an owned group and disposes its resources.

No browser/WebGL render was available through this connector execution, so rendered surveying-reference comparison and accessibility remain pending.

## Camera framing update — 2026-09-22

The demo now uses model-only bounds for explicit Overview/Camera fitting and preserves the chosen view during ordinary parameter changes. Geometry-only checks and remaining live visual review gates are recorded in [the framing review](../../../docs/VISUALIZATION-FRAMING-REVIEW.md). This update does not change engineering or rights status.
