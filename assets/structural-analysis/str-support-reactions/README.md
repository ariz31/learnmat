# Support reactions and restraints

Status: candidate.

## Learning objective

Compare the idealized planar restraints of pin, roller, and fixed supports and identify their admissible reaction components in a spatial structural scene.

## Model and assumptions

The component remains a constraint diagram rather than a solved equilibrium problem. A pin restrains x and y translation, a horizontal roller restrains y translation, and a fixed support restrains x/y translation plus rotation about z. Reaction arrows show admissible positive components only.

The analytical model is kept in `src/model.mjs`. The premium 3D renderer in `src/asset.mjs` consumes that model and does not change its equations, sign conventions, or SI outputs.

## 3D presentation

Version 0.2.0 replaces the former flat SVG-primary presentation with a real Three.js scene. The reusable component requires a host-provided **Three.js 0.185.1** namespace and host-owned `THREE.Scene`, consistent with the LearnMat runtime contract. The demo pins the same version through an import map and provides the perspective camera, OrbitControls, antialiased WebGL renderer, lighting, shadows, focus mode, and responsive resize behavior.

Use `demo/index.html` for the full editorial 3D presentation or import `src/asset.mjs` into any host that supplies the declared Three.js peer and a scene.

Network access is required by the demonstration page because it loads the pinned Three.js peer from jsDelivr. The reusable component itself never creates a renderer, camera, requestAnimationFrame loop, or an undeclared library instance.

## Scope boundary

No load case is solved. Arrow direction does not assert the actual sign or magnitude of a reaction.

## Reuse and rights

Original LearnMat contribution under the repository MIT license. No external 3D models, textures, images, fonts, or datasets are embedded. Three.js is an external runtime peer and is declared explicitly in metadata.

## Review evidence

The checked-in preview is a representative authored preview, not a fabricated browser screenshot. Independent live-browser rendering, responsive-layout, and assistive-technology checks remain required before public approval.

## Change history

- 0.2.0 — Rebuilt as a premium, surveying-style Three.js presentation while retaining the analytical model.
- 0.1.0 — Initial candidate component.
