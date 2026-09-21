# Timber specimen grain orientation

Status: candidate.

A reusable SVG component for a rectangular timber coupon with a **stylized surface grain direction** relative to the specimen longitudinal axis. It is intended to teach orientation and specimen geometry without implying species, grade, mechanical properties, moisture condition, or code classification.

## Learning objective

Relate a visible surface-grain direction to the specimen longitudinal axis, distinguish geometry from material properties, and understand that an illustrative wood texture does not establish anatomical orientation or engineering grade.

## Model and assumptions

- Internal length unit: metres.
- API angle unit: radians, per the runtime contract.
- Specimen longitudinal axis: +X.
- Thickness axis: +Y.
- Width lies across Z.
- Positive `grainAngleRad` is measured from +X toward -Z on the displayed top surface.
- Grain direction unit vector: `(cos θ, 0, -sin θ)`.
- Geometric volume: `V = length × width × thickness`.
- Accepted grain-angle range: -π/4 to +π/4 rad (-45° to +45°).
- The surface lines are deterministic decorative marks generated from the supplied seed. They have no physical growth-ring spacing, fiber-diameter scale, species identity, defect class, or grade meaning.
- The asset does **not** model anatomical longitudinal/radial/tangential (L/R/T) classification, knots, checks, slope-of-grain grading rules, moisture, density, strength, stiffness, shrinkage, or treatment.

Default specimen:

- length = 0.300 m
- width = 0.075 m
- thickness = 0.025 m
- grain angle = 8° = 0.1396263402 rad
- volume = 0.0005625 m³ = 562.5 cm³
- grain direction ≈ (0.990268, 0, -0.139173)

## Usage

Open `demo/index.html` from a local static server, or import the component:

```js
import { createAsset } from './src/asset.mjs';

const timber = createAsset({
  container: document.querySelector('#timber'),
  seed: 20260922,
  reducedMotion: true,
});

timber.setParameters({
  lengthM: 0.30,
  widthM: 0.075,
  thicknessM: 0.025,
  grainAngleRad: 8 * Math.PI / 180,
  grainDensity: 'medium',
  showDimensions: true,
  showOrientation: true,
});

console.log(timber.snapshot());
timber.dispose();
```

### Parameters

| Parameter | Type | Default | Range / values |
| --- | --- | --- | --- |
| `lengthM` | number | 0.30 | 0.10–1.20 m |
| `widthM` | number | 0.075 | 0.025–0.30 m |
| `thicknessM` | number | 0.025 | 0.005–0.10 m |
| `grainAngleRad` | number | π/22.5 | -π/4 to +π/4 rad |
| `grainDensity` | string | `medium` | `none`, `light`, `medium`, `dense` |
| `showDimensions` | boolean | true | true / false |
| `showOrientation` | boolean | true | true / false |

`setParameters` validates the complete next state before mutation. `update(timeSeconds)` records absolute non-negative time but does not animate this static asset. `reset` restores defaults. `resize` records the host viewport. `snapshot` returns serializable geometry and grain direction. `dispose` is idempotent.

No network or third-party runtime dependency is required.

## Reuse and rights

Original LearnMat repository contribution. No third-party texture, wood species dataset, grading table, model, photo, or font file is embedded. Repository license: MIT (`LICENSE`).

## Review evidence

- Static preview: `previews/default.svg`
- Geometry/orientation targets: `checks/geometry.md`
- Review record: `REVIEW.md`

The preview is a static reference render, not a claimed browser screenshot. Browser, responsive, and assistive-technology execution remain separate gates before approval.

## Change history

- 0.1.0 — Initial candidate with timber coupon dimensions, deterministic stylized surface grain, grain-angle orientation arrows, and serializable geometry/orientation state.
