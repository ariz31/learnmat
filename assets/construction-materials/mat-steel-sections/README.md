# Parametric steel section specimens

Status: candidate.

A reusable SVG component for visualizing generic I-section, channel, and angle cross-section geometry. It is a **materials specimen and geometry asset**, not a structural design tool or standards catalogue.

## Learning objective

Use explicit nominal dimensions to recognize common steel section forms and relate those dimensions to idealized cross-sectional area without confusing geometry with structural capacity, steel grade, or a published standard designation.

## Model and assumptions

### I-section and channel

The idealized area is

`A = 2 b t_f + (d - 2 t_f) t_w`

where:

- `d` = overall depth,
- `b` = flange width,
- `t_w` = web thickness,
- `t_f` = flange thickness.

The representation uses sharp corners. It omits root/toe radii, flange taper, rolling tolerances, residual stress, imperfections, and manufacturer/standard-specific geometry.

Default I-section:

- `d = 0.300 m`
- `b = 0.150 m`
- `t_w = 0.008 m`
- `t_f = 0.012 m`
- `A = 0.005808 m² = 5808 mm²`

### Angle

The idealized area is

`A = t (L_x + L_y - t)`

for two orthogonal rectangular legs with common thickness `t`.

Default angle:

- `L_x = 0.100 m`
- `L_y = 0.100 m`
- `t = 0.010 m`
- `A = 0.001900 m² = 1900 mm²`

No section modulus, moment of inertia, shear area, torsional constant, buckling resistance, connection capacity, design resistance, or material strength is provided.

## Usage

Open `demo/index.html` from a local static server, or import the reusable component:

```js
import { createAsset } from './src/asset.mjs';

const section = createAsset({
  container: document.querySelector('#section'),
  seed: 20260922,
  reducedMotion: true,
});

section.setParameters({
  shape: 'i-section',
  depthM: 0.30,
  flangeWidthM: 0.15,
  webThicknessM: 0.008,
  flangeThicknessM: 0.012,
  showDimensions: true,
});

console.log(section.snapshot());
section.dispose();
```

### Parameters

| Parameter | Type | Default | Range / values |
| --- | --- | --- | --- |
| `shape` | string | `i-section` | `i-section`, `channel`, `angle` |
| `depthM` | number | 0.30 | 0.08–0.60 m |
| `flangeWidthM` | number | 0.15 | 0.05–0.30 m |
| `webThicknessM` | number | 0.008 | 0.003–0.030 m |
| `flangeThicknessM` | number | 0.012 | 0.004–0.040 m |
| `legXM` | number | 0.10 | 0.04–0.30 m |
| `legYM` | number | 0.10 | 0.04–0.30 m |
| `thicknessM` | number | 0.010 | 0.003–0.030 m |
| `showDimensions` | boolean | true | true / false |

The setter validates the complete next state before mutation. `update(timeSeconds)` records absolute non-negative time but does not animate this static component. `reset` restores defaults. `resize` records the host viewport while SVG remains responsive. `snapshot` returns serializable dimensions, area, idealization note, and bounding box. `dispose` is idempotent.

No network or third-party runtime dependency is required.

## Reuse and rights

Original LearnMat repository contribution. No third-party section table, manufacturer geometry, model, texture, font file, or dataset is embedded. Repository license: MIT (`LICENSE`).

## Review evidence

- Static preview: `previews/default.svg`
- Geometry targets: `checks/geometry.md`
- Review record: `REVIEW.md`

The preview is a static reference render, not a claimed browser screenshot. Browser, responsive, and assistive-technology execution remain separate gates before approval.

## Change history

- 0.1.0 — Initial candidate with parametric I-section, channel, and angle geometry, dimension labels, area calculations, and explicit sharp-corner limitations.
