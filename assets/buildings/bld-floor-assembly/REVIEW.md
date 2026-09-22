# Asset review — bld-floor-assembly 0.2.0

## Engineering
The original layer-thickness arithmetic is retained. Solid build-up excludes the service void and exploded display gaps. Independent engineering review remains open.

## Spatial 3D
Primary output is real Three.js geometry. Solid layers are volumetric; the service void is visibly non-solid and exploded offsets are display-only.

## Browser / accessibility
Source includes a host-owned WebGL renderer, perspective camera, OrbitControls, responsive resize, labeled controls, and focus mode. Live browser/mobile/keyboard/assistive-technology evidence remains not-reviewed.

## Rights
Original procedural geometry. Three.js is the declared runtime dependency; no third-party models or textures are embedded.

## Decision
Candidate only. Do not promote until the normal independent review gates pass.

## Camera framing update — 2026-09-22

The demo now uses model-only bounds for explicit Overview/Camera fitting and preserves the chosen view during ordinary parameter changes. Geometry-only checks and remaining live visual review gates are recorded in [the framing review](../../../docs/VISUALIZATION-FRAMING-REVIEW.md). This update does not change engineering or rights status.
