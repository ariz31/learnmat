# Parametric Staircase Geometry

Status: candidate.

This dependency-free SVG component models a straight stair flight using total rise,
number of risers, going, and stair width. It emphasizes exact geometric
relationships and deliberately avoids jurisdiction-specific compliance claims.

## Model and assumptions

Internal units are metres. Coordinates use the LearnMat convention: +Y is up,
+X follows the stair flight, and the stair width extends along -Z.

The upper floor is treated as the terminal walking surface. Therefore:

    riserHeight = totalRise / risers

    goings = risers - 1

    flightRun = goings × going

    pitch = atan(totalRise / flightRun)

For the default values:

- totalRise = 3.00 m
- risers = 17
- going = 0.280 m
- width = 1.20 m

the derived geometry is approximately:

- riser height = 176.47 mm
- goings = 16
- flight run = 4.48 m
- geometric pitch = 33.81°

The graphic uses a uniform profile scale; numerical labels are generated from the
same model used by snapshot(). No claim is made that the chosen dimensions comply
with a particular building code, accessibility standard, fire code, or local rule.

## Usage

The demo entrypoint is assets/buildings/bld-staircase/demo/index.html.
The reusable module is src/asset.mjs and exports createAsset(context).

The runtime supports setParameters, update, reset, resize, snapshot, and idempotent
dispose. update accepts absolute seconds but the staircase is static. No network
or third-party runtime dependency is required.

## Reuse and rights

This is original repository source with no embedded third-party models, textures,
fonts, or datasets. Repository MIT licensing applies.

## Review evidence

REVIEW.md records the candidate review. previews/default.svg is a deterministic
static reference illustration, not a browser screenshot. Independent browser and
accessibility review remain required before approval.

## Change history

- 0.1.0: Initial straight-flight parametric staircase component and demo.
