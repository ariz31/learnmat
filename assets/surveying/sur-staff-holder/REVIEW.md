# Asset review — sur-staff-holder 0.2.0

## Engineering
Authoritative geometry remains x=H sin θ and y=H cos θ. H=3 m, θ=0 gives (0,3); θ=5° gives x≈0.26147 m and y≈2.98858 m. Reading height cannot exceed staff height.
Gate: source/model passed.

## Spatial 3D
Primary visual is real Three.js mesh geometry: articulated surveyor, safety gear, volumetric staff, graduation bands, reading ring and plumb reference, with perspective camera and shadows in the demo. The former SVG is no longer the primary preview.
Gate: implemented; live rendered comparison to surveying references still pending.

## Animation / pedagogy
Plumb action interpolates the actual tilt parameter to zero, so the visible pole and computed offset converge together. Reduced motion only suppresses person breathing, not the educational correction.
Gate: source-reviewed; live interaction pending.

## Browser / accessibility
Native controls, descriptive role text and focus mode are present. Browser/mobile/keyboard/WebGL-failure/AT execution remains not-reviewed.

## Rights
Original procedural geometry; Three.js declared externally. No images or third-party 3D models.

## Decision
Remain in-review until live rendered evidence, browser and accessibility checks are captured.

## Camera framing update — 2026-09-22

The demo now uses model-only bounds for explicit Overview/Camera fitting and preserves the chosen view during ordinary parameter changes. Geometry-only checks and remaining live visual review gates are recorded in [the framing review](../../../docs/VISUALIZATION-FRAMING-REVIEW.md). This update does not change engineering or rights status.
