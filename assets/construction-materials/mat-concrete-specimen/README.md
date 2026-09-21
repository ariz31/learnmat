# Concrete specimen geometry

Status: candidate.

A reusable, dependency-free SVG component for teaching the nominal geometry of concrete cylinder and cube specimens. The component deliberately separates **geometry and illustrative appearance** from engineering material properties.

## Learning objective

Use nominal specimen dimensions to distinguish cylinder and cube geometry, compare volume and surface area, and recognize that a visual concrete texture is not measured aggregate grading, mix composition, strength, density, or certification.

## Model and assumptions

- Internal length unit: metres.
- Geometry basis: right-handed, +Y up, specimen base at Y = 0, specimen centred on X/Z.
- Cylinder: radius (r=d/2), volume (V=\pi r^2h), surface area (A=2\pi r(h+r)).
- Cube: volume (V=s^3), surface area (A=6s^2).
- Diameter range: 0.05–0.30 m.
- Cylinder height range: 0.05–0.60 m.
- Cube side range: 0.05–0.30 m.
- Default geometry: 0.15 m diameter × 0.30 m height cylinder.
- Aggregate-like dots are deterministic decorative marks only. They do not have a physical particle scale and must not be interpreted as sieve size, petrography, void content, or mix design.
- No concrete strength, elastic modulus, density, durability, curing, temperature, moisture, grade, manufacturer, or code-specific claim is encoded.

The default cylinder check is:

- (r=0.075\,m)
- (V=\pi(0.075)^2(0.30)=0.0053014376\,m^3=5.3014376\,L)
- (A=2\pi(0.075)(0.30+0.075)=0.1767145868\,m^2)

## Usage

Open `demo/index.html` from a local static server, or import the reusable module:

```js
import { createAsset } from './src/asset.mjs';

const specimen = createAsset({
  container: document.querySelector('#specimen'),
  seed: 20260922,
  reducedMotion: true,
});

specimen.setParameters({
  shape: 'cylinder',
  diameterM: 0.15,
  heightM: 0.30,
  aggregateLevel: 'medium',
  showDimensions: true,
});

console.log(specimen.snapshot());
specimen.dispose();
```

### Parameters

| Parameter | Type | Default | Accepted values |
| --- | --- | --- | --- |
| `shape` | string | `cylinder` | `cylinder`, `cube` |
| `diameterM` | number | 0.15 | 0.05–0.30 m |
| `heightM` | number | 0.30 | 0.05–0.60 m |
| `sideM` | number | 0.15 | 0.05–0.30 m |
| `aggregateLevel` | string | `medium` | `none`, `light`, `medium` |
| `showDimensions` | boolean | true | true / false |

`setParameters` validates the complete next parameter state before mutation. `update(timeSeconds)` records absolute non-negative time but does not animate this static asset. `reset` restores defaults. `resize` records the host viewport while SVG remains responsive. `snapshot` returns serializable parameters and computed geometry. `dispose` is idempotent; all other methods throw after disposal.

No network or third-party runtime dependency is required.

## Reuse and rights

Original LearnMat repository contribution. The implementation and preview use no third-party model, texture, font file, dataset, or manufacturer data. Repository license: MIT (`LICENSE`).

## Review evidence

- Static preview: `previews/default.svg`.
- Geometry check: `checks/geometry.md`.
- Review record: `REVIEW.md`.

The preview is a static reference render of the default component state, not a claimed browser screenshot. Browser, responsive, and assistive-technology execution remain separate gates before approval.

## Change history

- 0.1.0 — Initial candidate component with cylinder/cube geometry, deterministic illustrative surface detail, dimension labels, and serializable geometry snapshot.
