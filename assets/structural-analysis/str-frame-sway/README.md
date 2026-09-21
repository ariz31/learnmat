# Portal frame lateral sway

Status: candidate.

## Learning objective

Relate story drift ratio to true top translation and compare undeformed and explicitly exaggerated sway geometry in three dimensions.

## Model and assumptions

The retained model is kinematic: fixed bases, a rigid horizontal top beam, and equal prescribed translation of the two top joints. True `deltaX = driftRatio × storyHeightM`. The exaggeration parameter affects presentation only.

The engineering/detailing model stays in `src/model.mjs`; the 0.2.0 Three.js layer consumes those outputs and does not replace them.

## 3D presentation

Version 0.2.0 uses a real host-rendered Three.js scene with perspective, orbit/pan/zoom, antialiasing, soft shadows, publication-style controls, focus mode, and responsive resize behavior. The reusable component requires host-provided **Three.js 0.185.1** and a host-owned scene. The demo pins that peer through an import map and owns the camera, renderer, animation loop, lighting, and OrbitControls.

The 3D scene uses translucent undeformed members, solid deformed HSS-like members, base plates/anchors, a lateral vector and labels for true versus displayed translation.

The demonstration page requires network access for the declared Three.js peer. No renderer, camera, hidden requestAnimationFrame loop, or undeclared library instance is created inside the reusable component.

## Scope boundary

No stiffness, forces, moments, P–Δ effects, connection flexibility or code drift limit is solved.

## Reuse and rights

Original LearnMat contribution under the repository MIT license. No external 3D models, images, textures, fonts, or datasets are embedded. Three.js is a declared external peer.

## Review evidence

The preview is authored representative evidence, not a fabricated runtime screenshot. Independent live-browser, responsive-layout, WebGL, and assistive-technology review remains required.

## Change history

- 0.2.0 — Premium surveying-style Three.js rebuild.
- 0.1.0 — Initial candidate component.
