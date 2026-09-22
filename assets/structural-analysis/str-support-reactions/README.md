# Support reactions and restraints

Status: candidate.

## Learning objective

Compare the idealized planar restraints of pin, roller, and fixed supports and identify their admissible reaction components in a spatial structural scene.

## Model and assumptions

The component remains a constraint diagram rather than a solved equilibrium problem. A pin restrains x and y translation, a horizontal roller restrains y translation, and a fixed support restrains x/y translation plus rotation about z. Reaction arrows show admissible positive components only.

The analytical model is kept in `src/model.mjs`. The Three.js renderer in `src/asset.mjs` consumes that model and does not change its equations, sign conventions, or SI outputs.

## 3D presentation and annotation system

Version 0.3.0 replaces the former free-floating label sprites with projected screen-space leader annotations. The component now exposes semantic 3D annotation anchors in `snapshot().annotations`; the host demo projects those anchors through the active camera.

Callouts are sorted by projected anchor elevation, assigned successive leader levels, and distributed vertically with collision spacing. This keeps the leader field ordered and non-crossing while the learner orbits, pans, zooms, changes support type, enters focus mode, or resizes the viewport. Typography, label width, leader offsets, and endpoint markers scale responsively with the viewport and camera distance.

The reusable component still requires a host-provided **Three.js 0.185.1** namespace and host-owned `THREE.Scene`. The demo provides the perspective camera, OrbitControls, WebGL renderer, lighting, shadows, focus mode, annotation projection, and responsive resize behavior.

## Scope boundary

No load case is solved. Arrow direction does not assert the actual sign or magnitude of a reaction. Leader annotations identify model features and admissible components only.

## Reuse and rights

Original LearnMat contribution under the repository MIT license. No external 3D models, textures, images, fonts, or datasets are embedded. Three.js is an external runtime peer and is declared explicitly in metadata.

## Review evidence

The authoritative presentation is the live Three.js entrypoint; no static catalog preview image is used. Independent live-browser rendering, responsive-layout, and assistive-technology checks remain required before public approval.

## Change history

- 0.3.0 — Added ordered, collision-managed leader annotations with responsive typography and improved 3D edge/readability treatment.
- 0.2.0 — Rebuilt as a surveying-style Three.js presentation while retaining the analytical model.
- 0.1.0 — Initial candidate component.
