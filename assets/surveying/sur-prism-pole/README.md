# 3D Prism Pole Carrier

Status: in-review. Version 0.2.0 replaces the SVG schematic with a real Three.js field actor and target.

## Learning objective
Understand target height, pole verticality, prism-center location, and how tilt displaces the target horizontally.

## Model
The base remains fixed at (0,0,0). For target height H and tilt θ, prism center is **(H sin θ, H cos θ, 0)**. Its distance from the base remains H.

## 3D implementation
The primary scene now contains a procedural articulated surveyor with hardhat/vest, striped volumetric pole, pointed foot, reflector frame, octahedral prism target, target ring, ground point and dashed plumb reference. “Plumb pole” animates the real tilt parameter toward zero, keeping geometry and metrics synchronized.

The host demo supplies camera/orbit, PBR lighting, shadows, ground, grid, focus mode and responsive controls.

## Rights
Original procedural geometry only. No generated images or downloaded 3D models.

## Change history
- 0.2.0 — Full Three.js surveyor/pole/reflector rebuild.
- 0.1.0 — SVG schematic.
