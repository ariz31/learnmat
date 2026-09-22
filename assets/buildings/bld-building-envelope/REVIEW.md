# Asset review — bld-building-envelope 0.2.0

## Engineering
The deterministic envelope model and its existing dimensional constraints are retained. Independent engineering review remains open.

## Spatial 3D
Primary output is now real Three.js geometry with depth, floor plates, volumetric facade framing, glazing, side/back enclosure, and cutaway exposure. No flat SVG is used as the primary visual.

## Browser / accessibility
Source includes a host-owned WebGL renderer, perspective camera, OrbitControls, responsive resize, labeled controls, and focus mode. Live browser/mobile/keyboard/assistive-technology evidence remains not-reviewed.

## Rights
Original procedural geometry. Three.js is the declared runtime dependency; no third-party models or textures are embedded.

## Decision
Candidate only. Do not promote until the normal independent review gates pass.
