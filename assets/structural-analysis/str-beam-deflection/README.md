# Simply supported beam response

Status: candidate.

## Learning objective

Connect a centered point load to support reactions, shear, bending moment, and linear-elastic deflection in one coordinated 3D structural study.

## Model and assumptions

The retained model is a prismatic simply supported Euler–Bernoulli beam with one downward centered point load, constant E and I, small deflection, and positive sagging bending moment. Closed-form reactions, moment and deflection remain exactly those documented in `checks/analytical.md`.

The analytical model is kept in `src/model.mjs`. The premium 3D renderer in `src/asset.mjs` consumes that model and does not change its equations, sign conventions, or SI outputs.

## 3D presentation

Version 0.2.0 replaces the former flat SVG-primary presentation with a real Three.js scene. The reusable component requires a host-provided **Three.js 0.185.1** namespace and host-owned `THREE.Scene`, consistent with the LearnMat runtime contract. The demo pins the same version through an import map and provides the perspective camera, OrbitControls, antialiased WebGL renderer, lighting, shadows, focus mode, and responsive resize behavior.

The 3D beam uses a translucent undeformed reference, a display-exaggerated segmented deformed member, spatial load/reaction vectors, and shear/moment traces beneath the member. The right rail reports physical SI values.

Network access is required by the demonstration page because it loads the pinned Three.js peer from jsDelivr. The reusable component itself never creates a renderer, camera, requestAnimationFrame loop, or an undeclared library instance.

## Scope boundary

This is one bounded analytical case, not a general beam finite-element solver or a design-code check. The displayed deflection geometry is exaggerated automatically and the factor is reported.

## Reuse and rights

Original LearnMat contribution under the repository MIT license. No external 3D models, textures, images, fonts, or datasets are embedded. Three.js is an external runtime peer and is declared explicitly in metadata.

## Review evidence

The checked-in preview is a representative authored preview, not a fabricated browser screenshot. Independent live-browser rendering, responsive-layout, and assistive-technology checks remain required before public approval.

## Change history

- 0.2.0 — Rebuilt as a premium, surveying-style Three.js presentation while retaining the analytical model.
- 0.1.0 — Initial candidate component.
