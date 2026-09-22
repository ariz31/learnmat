# Surveying Walking Person

Status: in-review. Version 0.2.0 is a real Three.js rebuild of the earlier SVG primitive.

## Learning objective
Relate walking speed, elapsed time, path distance, gait phase, and endpoint stopping in a spatial field scene.

## 3D scene and model
The reusable component creates an articulated procedural surveyor, safety vest, hardhat, boots, measured path, and endpoint markers as real Three.js meshes. The host owns the renderer, camera, controls, clock, lighting, and ground context.

Travel remains authoritative: **d(t) = min(L, v·max(t,0))**. Gait phase is **2π f min(t,L/v)** when v>0, so the body stops cycling after arrival. Limb swing is illustrative animation tied to the same gait phase; distance and arrival time remain exact.

Axes follow LearnMat: +X east/right, +Y up, north along -Z. Inputs are SI.

## Usage
The component requires `context.THREE` and `context.scene`. The demo pins Three.js 0.185.1, adds perspective camera, orbit/pan/zoom, shadows, environmental depth cues, responsive controls, play/pause/reset, and focus mode. The component itself never starts a render loop.

## Rights
All person/equipment geometry is original procedural geometry. No generated images, downloaded models, or textures are used.

## Review evidence
See `REVIEW.md`. Live browser capture is intentionally not claimed in this connector-only remediation; the old SVG preview is no longer the asset preview.

## Change history
- 0.2.0 — Rebuilt primary visual and component as articulated Three.js geometry with surveying-grade scene presentation.
- 0.1.0 — Initial SVG primitive.
