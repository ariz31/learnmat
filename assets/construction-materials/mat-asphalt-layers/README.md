# Asphalt material specimen and layered sample

Status: candidate.

A reusable SVG component for inspecting generic asphalt-layer geometry as a rectangular slab sample or cylindrical core specimen. It teaches layer proportions and geometric volume, not pavement design or asphalt-mixture performance.

## Learning objective

After using the demo, a learner should be able to:

- add individual asphalt-layer thicknesses to obtain total specimen thickness;
- compute layer volume from area and thickness;
- compare layer proportions in slab and core views;
- verify thickness and volume closure;
- distinguish geometric layer visualization from a pavement design recommendation or material-property claim.

## Educational sequence

1. Choose slab or core view.
2. Set three generic layer thicknesses and relevant sample dimensions.
3. Use the visible relationships `T = t1 + t2 + t3` and `Vi = area × ti`.
4. Inspect the visual proportions.
5. Expand the calculation table for per-layer thickness fraction and volume.
6. Confirm the live thickness-sum and volume-sum checks.
7. Conclude only about geometric proportions and sample volume.

The demo provides **Focus visual** mode; exiting focus preserves parameters and model state. Animation is intentionally omitted because this asset teaches static section geometry and arithmetic comparison. Decorative motion would not improve the learning objective.

## Default example

- top layer = 0.040 m
- middle layer = 0.060 m
- bottom layer = 0.080 m
- total thickness = **0.180 m**
- slab length = 0.400 m
- slab width = 0.300 m
- slab plan area = **0.120 m²**

Layer slab volumes:

- top = 0.120 × 0.040 = **0.0048 m³ = 4.80 L**
- middle = 0.120 × 0.060 = **0.0072 m³ = 7.20 L**
- bottom = 0.120 × 0.080 = **0.0096 m³ = 9.60 L**
- total = **0.0216 m³ = 21.60 L**

For the default 0.100 m diameter core:

- core area = π(0.05)² = **0.0078539816 m²**
- total core volume = area × 0.180 = **0.0014137167 m³ = 1.4137 L**

Thickness fractions are 22.22%, 33.33%, and 44.44%.

## Limits

The three layers are generic **Layer A/B/C**. The component does not encode:

- surface/binder/base-course design requirements;
- aggregate gradation, density, air voids, binder content, compaction, temperature, stiffness, fatigue, rutting, or moisture susceptibility;
- construction tolerances, tack coat, prime coat, underlying base/subgrade, or any agency/project specification.

Texture marks are deterministic and illustrative only.

## Usage

Open `demo/index.html` from a local static server or import `src/asset.mjs`.

| Parameter | Default | Accepted |
| --- | --- | --- |
| `topThicknessM` | 0.04 | 0.01–0.15 m |
| `middleThicknessM` | 0.06 | 0.01–0.20 m |
| `bottomThicknessM` | 0.08 | 0.01–0.25 m |
| `sampleLengthM` | 0.40 | 0.10–1.00 m |
| `sampleWidthM` | 0.30 | 0.10–1.00 m |
| `coreDiameterM` | 0.10 | 0.05–0.20 m |
| `view` | `layered-slab` | `layered-slab`, `core` |
| `showTexture` | true | boolean |
| `showDimensions` | true | boolean |

## Reuse and rights

Original LearnMat contribution. No external asphalt texture, mix table, pavement-design catalogue, photo, or product data is embedded. Repository license: MIT.

## Review evidence

- `previews/default.svg`
- `checks/geometry.md`
- `REVIEW.md`

## Change history

- 0.1.0 — Initial slab/core layered sample geometry, thickness/volume checks, progressive educational details, and focus presentation mode.
