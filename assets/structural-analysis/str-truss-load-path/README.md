# Triangular truss load path

Status: candidate.

## Learning objective

Trace a centered vertical joint load through the two compression diagonals and the bottom tension tie of an ideal determinate triangular truss.

## Model and assumptions

The analytical topology remains an ideal pin-jointed planar truss with a pin at A, a horizontal roller at C, and a vertical apex joint load. Positive axial force is tension; AB/BC are compression and AC is tension for the default downward load.

The analytical model is kept in `src/model.mjs`. The premium 3D renderer in `src/asset.mjs` consumes that model and does not change its equations, sign conventions, or SI outputs.

## 3D presentation

Version 0.2.0 replaces the former flat SVG-primary presentation with a real Three.js scene. The reusable component requires a host-provided **Three.js 0.185.1** namespace and host-owned `THREE.Scene`, consistent with the LearnMat runtime contract. The demo pins the same version through an import map and provides the perspective camera, OrbitControls, antialiased WebGL renderer, lighting, shadows, focus mode, and responsive resize behavior.

The 3D scene gives members real depth, joint hardware, support geometry and spatial vectors while preserving the planar analytical coordinates in the snapshot.

Network access is required by the demonstration page because it loads the pinned Three.js peer from jsDelivr. The reusable component itself never creates a renderer, camera, requestAnimationFrame loop, or an undeclared library instance.

## Scope boundary

This is a pedagogical determinate truss case, not a spatial-truss solver, member design check, buckling check, or code-compliance result.

## Reuse and rights

Original LearnMat contribution under the repository MIT license. No external 3D models, textures, images, fonts, or datasets are embedded. Three.js is an external runtime peer and is declared explicitly in metadata.

## Review evidence

The checked-in preview is a representative authored preview, not a fabricated browser screenshot. Independent live-browser rendering, responsive-layout, and assistive-technology checks remain required before public approval.

## Change history

- 0.2.0 — Rebuilt as a premium, surveying-style Three.js presentation while retaining the analytical model.
- 0.1.0 — Initial candidate component.
