# Exploded Floor Assembly — 3D

Status: candidate. Version 0.2.0 replaces the SVG-primary layer stack with real Three.js solids.

## Learning objective

Inspect the order and physical thickness of finish, screed, slab, service void, and ceiling board while distinguishing real build-up from display-only exploded separation.

## Authoritative model

`src/model.mjs` remains the single source of layer thicknesses and exploded offsets. The service void is represented as a non-solid spatial volume; it is not counted as solid thickness.

## 3D presentation

Each solid layer is a dimensionally linked box with edge cues. The service void is shown as a transparent/wire volume with illustrative service runs so its non-solid nature is visually explicit. The host owns renderer, camera, controls, lighting, and animation.

No structural capacity, acoustic rating, fire rating, or code-compliance claim is made.
