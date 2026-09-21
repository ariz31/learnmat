# Parametric reinforcement cage

Status: candidate.

## Learning objective

Inspect a rectangular RC column cage in three dimensions and understand how cover, bar diameters, perimeter counts and maximum requested tie spacing define the geometry.

## Model and assumptions

The retained geometry convention measures clear cover from the concrete face to the **outer surface of the transverse tie**. Tie and longitudinal-bar centerline insets, unique perimeter bars, and actual tie spacing are calculated exactly as documented in `checks/analytical.md`.

The engineering/detailing model stays in `src/model.mjs`; the 0.2.0 Three.js layer consumes those outputs and does not replace them.

## 3D presentation

Version 0.2.0 uses a real host-rendered Three.js scene with perspective, orbit/pan/zoom, antialiasing, soft shadows, publication-style controls, focus mode, and responsive resize behavior. The reusable component requires host-provided **Three.js 0.185.1** and a host-owned scene. The demo pins that peer through an import map and owns the camera, renderer, animation loop, lighting, and OrbitControls.

The scene renders a transparent concrete shell with edge lines, physical-diameter longitudinal bars and rectangular tie loops, plus spatial cover and spacing callouts.

The demonstration page requires network access for the declared Three.js peer. No renderer, camera, hidden requestAnimationFrame loop, or undeclared library instance is created inside the reusable component.

## Scope boundary

Detailing geometry only. Minimum reinforcement, confinement, development/lap length, seismic detailing, constructability and any ACI/NSCP/Eurocode compliance check remain out of scope.

## Reuse and rights

Original LearnMat contribution under the repository MIT license. No external 3D models, images, textures, fonts, or datasets are embedded. Three.js is a declared external peer.

## Review evidence

The preview is authored representative evidence, not a fabricated runtime screenshot. Independent live-browser, responsive-layout, WebGL, and assistive-technology review remains required.

## Change history

- 0.2.0 — Premium surveying-style Three.js rebuild.
- 0.1.0 — Initial candidate component.
