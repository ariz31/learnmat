# Exploded Floor Assembly

Status: candidate.

This dependency-free SVG component visualizes a floor build-up as an exploded
axonometric assembly. It separates physical layer thickness from display-only gaps
so learners can inspect thin layers without mistaking the exploded view for the
actual construction depth.

## Model and assumptions

The asset uses metres internally and the LearnMat right-handed convention: +Y is
up, +X is right/east, and north is along -Z. The default physical stack, from
bottom to top, is:

1. 12 mm ceiling board
2. 300 mm service void
3. 150 mm slab geometry
4. 40 mm screed / bedding
5. 12 mm floor finish

Default physical build-up:

    12 + 300 + 150 + 40 + 12 = 514 mm

Default solid-material thickness, excluding the service void:

    12 + 150 + 40 + 12 = 214 mm

The exploded gap is a display-only separation and is not included in either
physical build-up or component bounds. Vertical thicknesses are visually
exaggerated in the SVG so thin layers remain legible; numerical labels remain the
authoritative dimensions.

The slab is represented only as an assembly layer. This asset does not calculate
structural capacity, reinforcement, fire resistance, acoustics, thermal performance,
or jurisdiction-specific code compliance.

## Usage

The demo entrypoint is assets/buildings/bld-floor-assembly/demo/index.html.
The reusable module is src/asset.mjs and exports createAsset(context).

The runtime supports setParameters, update, reset, resize, snapshot, and idempotent
dispose. update accepts absolute seconds but the asset is intentionally static.
There are no network or third-party runtime dependencies.

## Reuse and rights

The source is original repository work with no embedded third-party models,
textures, fonts, or datasets. Repository MIT licensing applies.

## Review evidence

REVIEW.md records candidate review status. previews/default.svg is a deterministic
static reference illustration of the default parameter set, not a browser screenshot.
Independent browser and accessibility inspection remain required before approval.

## Change history

- 0.1.0: Initial exploded floor assembly component and demo.
