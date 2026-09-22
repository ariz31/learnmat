# Parametric Staircase Geometry — 3D

Status: candidate. Version 0.2.0 replaces the SVG-primary stair profile with real Three.js geometry.

## Learning objective

Connect total rise, riser count, going, stair width, horizontal run, and geometric pitch to a spatial straight-flight stair.

## Authoritative model

The existing `src/model.mjs` remains authoritative. Riser height is totalRise / risers, goings = risers - 1, run = goings × going, and pitch = atan2(totalRise, run).

## 3D presentation

The component builds each tread/riser as volumetric stair geometry and adds an upper landing plus a spatial pitch reference. The host owns renderer, camera, controls, lighting, and animation.

This asset teaches geometry only. It does not determine code-compliant riser/going limits, handrail requirements, headroom, egress width, or structural design.
