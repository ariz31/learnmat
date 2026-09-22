# Asset review — sur-ranging-rod 0.2.0

## Engineering
Observer, target and intermediate rod coordinates are unchanged from the 0.1.0 model. Default x=0.25 m with tolerance 0.05 m is outside tolerance; equality at 0.05 m is aligned.
Gate: source/model passed.

## Spatial 3D
Primary output is actual Three.js world geometry: observer, striped rods, line of sight, cross-track segment, tolerance corridor and station markers placed at the same coordinates returned by snapshot.
Gate: implemented; live rendered surveying-reference comparison pending.

## Animation / pedagogy
“Align rod” interpolates the actual crossTrackOffset to zero; the rod, red error segment, alignment state and metric all update from one model. Camera presets support overview and near-line inspection.
Gate: source-reviewed.

## Browser / accessibility
Semantic role text, native controls and focus mode are present. Live WebGL/mobile/keyboard/AT checks remain not-reviewed.

## Rights
Original procedural geometry; only declared Three.js runtime dependency.

## Decision
Remain in-review pending live rendered/browser/accessibility evidence.

## Camera framing update — 2026-09-22

The demo now uses model-only bounds for explicit Overview/Camera fitting and preserves the chosen view during ordinary parameter changes. Geometry-only checks and remaining live visual review gates are recorded in [the framing review](../../../docs/VISUALIZATION-FRAMING-REVIEW.md). This update does not change engineering or rights status.
