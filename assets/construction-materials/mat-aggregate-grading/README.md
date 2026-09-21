# Aggregate grading — 3D

Status: candidate · version 0.2.0 3D replacement.

## Learning objective

Connect the abstract grading curve/retained-mass calculation to a spatial aggregate sample and sieve-stack context.

## 3D educational design

A real 3D tray contains deterministic irregular aggregate meshes whose size mix changes qualitatively by teaching preset, while a five-level sieve stack supplies spatial context. The 3D particles never drive the analytical grading calculation.

The demo follows the current LearnMat surveying-quality pattern: a real Three.js scene, deliberate camera framing, lighting/shadows, orbit inspection, pause/play inspection rotation, camera reset, responsive HUD, focus mode, and concise progressive teaching text. The component itself does not own the renderer or animation loop; the host injects Three.js and the scene and advances absolute time through `update(timeSeconds)`.

## Governing model

retainedᵢ = passingᵢ₋₁ − passingᵢ; retained mass = sample mass × retainedᵢ/100; pan closes the remaining fraction.

The numerical model remains authoritative. 3D form, HUD values, and interaction are derived from the same validated parameter state.

## Limits

Teaching presets are illustrative only; no true particle scale, angularity, density, ASTM/AASHTO/DPWH/project envelope, or material acceptance decision is encoded.

## Runtime and dependencies

- Renderer: Three.js 0.185.1 supplied by the host/demo.
- Demo network requirement: yes, for the pinned jsDelivr Three.js module and OrbitControls.
- Component: reusable `createAsset(context)`, deterministic seed/time, validated setters, reset, resize, serializable snapshot, idempotent disposal.
- Geometry unit: metres; right-handed +Y-up basis.
- The demo's slow turntable is an inspection aid that reveals depth/occlusion. Pause stops it; reduced-motion uses a fixed pose.

## Review evidence

This replacement intentionally removes the old flat SVG preview from metadata. No browser screenshot is fabricated. `REVIEW.md` records source-level engineering and 3D implementation review; browser, responsive, visual, and assistive-technology gates remain not-reviewed until a real browser capture is available.

## Change history

- 0.2.0 — Replaced the flat SVG-primary presentation with a procedural real-3D Three.js educational scene and surveying-style presentation host.
