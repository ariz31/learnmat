# 3D Surveying Tape Team

Status: in-review. Version 0.2.0 replaces the flat SVG field scene with a true 3D field setup.

## Learning objective
See two operators hold a tape at equal support elevation while comparing the straight horizontal span to the actual sagging tape length.

## Model
For equal-height endpoints, `w = massPerLength·g`, `a = H/w`, sag `f = a[cosh(L/(2a))-1]`, and catenary length `S = 2a sinh(L/(2a))`. Straight mode gives f=0 and S=L.

## 3D implementation
Two articulated procedural surveyors stand at the actual endpoints. A physical-scale Three.js tube follows the sampled catenary in world coordinates; a dashed straight reference remains visible. Stakes and a tape reel provide field context. No visual sag exaggeration is required in the 3D rebuild.

The demo supplies perspective/orbit interaction, shadows, field ground, responsive focus mode, and live exact sag/curve-length values.

## Rights
Original procedural geometry only; no generated images or downloaded models.

## Change history
- 0.2.0 — True Three.js crew scene and physical-scale catenary tube.
- 0.1.0 — SVG schematic.
