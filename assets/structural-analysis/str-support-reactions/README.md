# Support reactions and restraints

Status: candidate.

## Learning objective

Compare the idealized planar restraints of pin, roller, and fixed supports and identify their admissible reaction components in a spatial structural scene.

## Model and assumptions

The component remains a constraint diagram rather than a solved equilibrium problem. A pin restrains x and y translation, a horizontal roller restrains y translation, and a fixed support restrains x/y translation plus rotation about z. Reaction arrows show admissible positive components only.

The analytical model is kept in `src/model.mjs`. The Three.js renderer in `src/asset.mjs` consumes that model and does not change its equations, sign conventions, or SI outputs.

## 3D presentation and annotation system

Version 0.3.2 retains the 0.3.0 projected leader system, which replaced the former free-floating label sprites with projected screen-space leader annotations. The component now exposes semantic 3D annotation anchors in `snapshot().annotations`; the host demo projects those anchors through the active camera.

Callouts are sorted by projected anchor elevation, assigned successive leader levels, and distributed vertically with collision spacing. This keeps the leader field ordered and non-crossing while the learner orbits, pans, zooms, changes support type, enters focus mode, or resizes the viewport. Typography, label width, leader offsets, and endpoint markers scale responsively with the viewport and camera distance.

The reusable component still requires a host-provided **Three.js 0.185.1** namespace and host-owned `THREE.Scene`. The demo provides the perspective camera, OrbitControls, WebGL renderer, lighting, shadows, focus mode, annotation projection, and responsive resize behavior.

## Progressive controls

The visualization removes the redundant “3D Structural visualization” caption. Scene commands now live inside the visualization behind an **Options** toggle, collapsed by default. Reset camera, reset model, and Focus view remain available there, including while Focus view is active.

The parameter controls are also collapsed by default behind a **Show/Hide Parameters** control. The live response/readout remains visible independently so the learner can read the current restraint state without exposing editing controls.

The in-scene Options menu now includes independent **Information** and **Labels** visibility toggles. Information hides the surrounding title, readout rail, explanatory caption, and transport footer while expanding the 3D viewport. Labels hides only the projected leader/callout layer. These states are independent of Focus view. The Focus action retains an explicit accent background so its text remains readable in both normal and focused states.

## Scope boundary

No load case is solved. Arrow direction does not assert the actual sign or magnitude of a reaction. Leader annotations identify model features and admissible components only.

## Reuse and rights

Original LearnMat contribution under the repository MIT license. No external 3D models, textures, images, fonts, or datasets are embedded. Three.js is an external runtime peer and is declared explicitly in metadata.

## Review evidence

The authoritative presentation is the live Three.js entrypoint; no static catalog preview image is used. Independent live-browser rendering, responsive-layout, and assistive-technology checks remain required before public approval.

## Change history

- 0.3.2 — Added Information/Labels visibility controls, expanded the viewport when information is hidden, and fixed Focus View option contrast.
- 0.3.1 — Removed redundant visualization text and moved parameters and scene commands behind default-collapsed progressive controls.
- 0.3.0 — Added ordered, collision-managed leader annotations with responsive typography and improved 3D edge/readability treatment.
- 0.2.0 — Rebuilt as a surveying-style Three.js presentation while retaining the analytical model.
- 0.1.0 — Initial candidate component.
