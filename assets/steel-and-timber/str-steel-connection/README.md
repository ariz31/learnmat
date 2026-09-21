# Exploded bolted steel shear connection

Status: candidate.

## Learning objective

Identify the support, shear plate, beam web/flanges and bolt group as a spatial assembly while reading the plate/bolt geometric fit relationships.

## Model and assumptions

The retained fit model centers a vertical bolt line in the plate. Vertical edge distance remains `(plateHeight - (boltCount-1)×boltSpacing)/2`; horizontal edge distance is `plateWidth/2`. Invalid groups are rejected before rendering.

The engineering/detailing model stays in `src/model.mjs`; the 0.2.0 Three.js layer consumes those outputs and does not replace them.

## 3D presentation

Version 0.2.0 uses a real host-rendered Three.js scene with perspective, orbit/pan/zoom, antialiasing, soft shadows, publication-style controls, focus mode, and responsive resize behavior. The reusable component requires host-provided **Three.js 0.185.1** and a host-owned scene. The demo pins that peer through an import map and owns the camera, renderer, animation loop, lighting, and OrbitControls.

The Three.js scene gives the support and beam I-section geometry, shear plate, bolt shanks, washers and hexagonal nuts real depth. `explodeM` separates assembly parts; the right rail reports exact model distances.

The demonstration page requires network access for the declared Three.js peer. No renderer, camera, hidden requestAnimationFrame loop, or undeclared library instance is created inside the reusable component.

## Scope boundary

Assembly geometry only. Bolt/weld capacity, bearing, tear-out, block shear, slip, prying, plate yielding, connection stiffness and design-code strength remain out of scope.

## Reuse and rights

Original LearnMat contribution under the repository MIT license. No external 3D models, images, textures, fonts, or datasets are embedded. Three.js is a declared external peer.

## Review evidence

The preview is authored representative evidence, not a fabricated runtime screenshot. Independent live-browser, responsive-layout, WebGL, and assistive-technology review remains required.

## Change history

- 0.2.0 — Premium surveying-style Three.js rebuild.
- 0.1.0 — Initial candidate component.
