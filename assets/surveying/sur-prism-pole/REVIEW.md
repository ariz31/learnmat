# Asset review — sur-prism-pole 0.2.0

## Engineering
Prism center remains (H sin θ, H cos θ, 0). H=2 m, θ=5° gives x≈0.174311 m and y≈1.992389 m; radial distance remains 2 m.
Gate: source/model passed.

## Spatial 3D
Primary output is real Three.js mesh geometry: volumetric surveyor, striped pole, pole point, reflector frame, target prism, plumb line and ground point in a perspective-lit scene.
Gate: implemented; live rendered comparison pending.

## Animation / pedagogy
Plumb action drives the actual tilt parameter to zero; target mesh, offset and vertical projection converge together. Reduced motion affects only decorative breathing.
Gate: source-reviewed.

## Browser / accessibility
Semantic role text, labeled controls and focus mode are present. Live browser/mobile/keyboard/AT checks remain not-reviewed.

## Rights
Original procedural geometry; declared Three.js dependency only.

## Decision
Remain in-review pending live rendered/browser/accessibility evidence.

## Camera framing update — 2026-09-22

The demo now uses model-only bounds for explicit Overview/Camera fitting and preserves the chosen view during ordinary parameter changes. Geometry-only checks and remaining live visual review gates are recorded in [the framing review](../../../docs/VISUALIZATION-FRAMING-REVIEW.md). This update does not change engineering or rights status.
