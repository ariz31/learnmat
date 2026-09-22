# 3D Ranging Rod Alignment

Status: in-review. Version 0.2.0 replaces the plan/elevation SVG with a coherent 3D field scene.

## Learning objective
See direct ranging as a spatial collinearity problem: observer, intermediate rod, and distant target should lie on one vertical plane/line, with the rod's cross-track offset measured perpendicular to the reference line.

## Model
Observer is (0,0,0), target is (0,0,-D), intermediate rod base is (x,0,-s). Therefore cross-track error is **|x|**, and alignment is true when **|x| ≤ tolerance**. Rod top is directly above its base at +Y=rodHeight.

## 3D implementation
The scene now contains an observer, two volumetric striped rods, pointed tips, ground/station marks, a dashed 3D line of sight, a real red cross-track segment and a translucent tolerance corridor. “Align rod” animates the actual cross-track parameter toward zero so the geometry and error metric agree at every frame.

The demo supplies field ground, perspective/orbit camera, line/overview views, shadows, focus mode and responsive controls.

## Rights
Original procedural geometry only. No generated images or downloaded 3D models.

## Change history
- 0.2.0 — True Three.js direct-ranging field scene and model-driven alignment animation.
- 0.1.0 — 2D plan/elevation SVG.
