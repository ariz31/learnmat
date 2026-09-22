# Asset review — bld-staircase 0.2.0

## Engineering
The existing rise, going, run, and pitch formulas are retained unchanged. Independent engineering review remains open.

## Spatial 3D
Primary output is real Three.js volumetric step geometry with an upper landing and a spatial pitch reference. No flat SVG is used as the primary visual.

## Browser / accessibility
Source includes a host-owned WebGL renderer, perspective camera, OrbitControls, responsive resize, labeled controls, and focus mode. Live browser/mobile/keyboard/assistive-technology evidence remains not-reviewed.

## Rights
Original procedural geometry. Three.js is the declared runtime dependency; no third-party models or textures are embedded.

## Decision
Candidate only. Do not promote until the normal independent review gates pass.
