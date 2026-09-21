# Masonry units with dimensioned voids and bond

Status: candidate.

A reusable SVG component for a generic hollow masonry unit and a schematic running-bond arrangement. It teaches geometry and bond offset while deliberately avoiding product, structural-capacity, or code-compliance claims.

## Learning objective

- Relate overall masonry-unit dimensions to simplified through-void geometry.
- Compare gross and idealized solid volume.
- Recognize the half-unit offset concept of running bond without treating the diagram as a complete construction detail.

## Model and assumptions

The unit is a rectangular prism with rectangular through-voids extending through the full unit height.

`V_gross = L × H × D`

`V_void = n × l_v × d_v × H`

`V_solid = V_gross - V_void`

Default inputs:

- L = 0.40 m
- H = 0.20 m
- D = 0.15 m
- two voids
- void length = 0.12 m
- void depth = 0.09 m
- schematic mortar joint = 0.01 m

Expected:

- gross volume = **0.0120 m³ = 12.00 L**
- total void volume = **0.00432 m³ = 4.32 L**
- idealized solid volume = **0.00768 m³ = 7.68 L**

The model omits face-shell taper, internal web shape, ribs, chamfers, manufacturing tolerances, reinforcement, mortar mechanics, grout, and code-specific detailing. The running-bond view demonstrates offset only.

## Usage

Open `demo/index.html` from a local static server, or import `src/asset.mjs`.

The runtime supports `setParameters`, `update`, `reset`, `resize`, `snapshot`, and idempotent `dispose`. No network or third-party runtime dependency is required.

## Parameters

| Parameter | Default | Accepted |
| --- | ---: | --- |
| `lengthM` | 0.40 m | 0.20–0.60 m |
| `heightM` | 0.20 m | 0.08–0.30 m |
| `depthM` | 0.15 m | 0.08–0.30 m |
| `voidLengthM` | 0.12 m | 0.03–0.24 m |
| `voidDepthM` | 0.09 m | 0.03–0.20 m, less than depth |
| `voidCount` | 2 | integer 1–3 |
| `mortarJointM` | 0.01 m | 0–0.03 m |
| `view` | `unit` | `unit`, `running-bond` |
| `showDimensions` | true | boolean |

## Reuse and rights

Original LearnMat contribution. No manufacturer drawing, code table, texture, photo, or proprietary geometry is embedded. Repository license: MIT (`LICENSE`).

## Review evidence

- `previews/default.svg`
- `checks/geometry.md`
- `REVIEW.md`

The preview is a static reference render, not a claimed browser screenshot. Browser and assistive-technology execution remain separate gates before approval.

## Change history

- 0.1.0 — Initial generic hollow-unit geometry and schematic running-bond demonstration.
