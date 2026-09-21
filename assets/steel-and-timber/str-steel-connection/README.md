# Exploded bolted steel shear connection

Status: candidate.

## Learning objective

Identify the support face, shear plate, beam web, and vertical bolt group of a simple bolted shear connection while keeping assembly geometry distinct from strength design.

## Model and assumptions

The component draws an exploded elevation/assembly view.

- Bolt centers form one vertical line centered horizontally in the plate.
- The bolt group is centered vertically in the plate.
- Actual vertical edge distance = `(plateHeight - (boltCount-1)*boltSpacing)/2`.
- Actual horizontal edge distance = `plateWidth/2`.
- Runtime validation requires both actual edge distances to meet the user-specified geometric minimum and requires spacing to exceed bolt diameter.
- `explodeM` controls assembly separation only; it is not deformation.

The requested edge distance is an illustrative **geometry constraint**, not a code-prescribed value. This asset does not calculate bolt shear, bearing, tear-out, block shear, slip, prying, weld capacity, plate yielding, or connection strength under AISC, NSCP, Eurocode, or any other design standard.

## Usage

Use `demo/index.html` or import `src/asset.mjs`. Dimensions use metres.

Invalid bolt groups that do not fit within the plate under the requested geometry are rejected before state mutation.

## Reuse and rights

Original repository contribution under the root MIT license. No third-party models, fonts, or libraries.

## Review evidence

See `REVIEW.md` and `checks/analytical.md`. Live browser screenshot and assistive-technology execution remain for independent review.

## Change history

- 0.1.0 — Initial exploded shear-plate connection geometry.
