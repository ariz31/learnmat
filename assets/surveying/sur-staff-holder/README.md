# 3D Leveling Staff Holder

Status: in-review. Version 0.2.0 replaces the former SVG primary visual with procedural Three.js geometry.

## Learning objective
Understand staff verticality, reading height, and the geometric consequence of tilt while seeing the staff handled by a recognizable field surveyor.

## Model and 3D scene
The staff base is fixed at the surveyed point. Positive tilt leans toward +X. Top coordinates remain **x = H sin θ** and **y = H cos θ**. The reading ring is attached to the real 3D staff and moves to the selected height. The plumb reference is spatially coincident with the true vertical axis.

The person, hardhat, vest, staff, graduations, reading ring, benchmark/base, and plumb line are actual Three.js geometry. The host demo supplies perspective camera, orbit controls, shadows, ground and depth cues. The **Plumb staff** action animates the actual tilt parameter toward zero.

## Usage
Requires host-supplied `THREE` and `scene`; the component owns no renderer or animation loop. Demo uses Three.js 0.185.1.

## Rights
Original procedural geometry only. No generated images or downloaded 3D models.

## Review evidence
See `REVIEW.md`. Live screenshot/browser evidence remains pending rather than reusing the obsolete SVG preview.

## Change history
- 0.2.0 — Full Three.js rebuild with articulated surveyor, graduated staff, reading marker, plumb reference and animated correction.
- 0.1.0 — SVG component.
