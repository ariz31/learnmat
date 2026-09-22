# Parametric Building Envelope — 3D

Status: candidate. Version 0.2.0 replaces the SVG-primary shell with real Three.js geometry.

## Learning objective

Relate overall dimensions, floor count, bay spacing, opening dimensions, sill height, and cutaway depth to a navigable building envelope.

## Authoritative model

The existing `src/model.mjs` remains authoritative. Width, depth, floor height, floor count, bay count, opening dimensions, sill height, and cutaway ratio are validated before geometry is rebuilt. The front enclosure is assembled around actual opening voids rather than painting windows over a solid wall.

## 3D presentation

The reusable component creates floor plates, facade piers/spandrels, glazing, back and side enclosure planes, and a cutaway that exposes floor plates. The host owns the Three.js renderer, camera, controls, lights, and animation loop.

This is a geometry-learning asset, not a structural, architectural-code, fire-safety, or energy-compliance model.
