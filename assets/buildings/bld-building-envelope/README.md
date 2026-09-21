# Parametric Building Envelope

Status: candidate.

This asset is a reusable, dependency-free SVG component for teaching whole-building
envelope geometry. It shows floor plates, repeated facade openings, overall width,
depth and height, and an adjustable cutaway plane.

## Model and assumptions

The geometry uses metres and the LearnMat right-handed convention: +Y is up, +X is
right/east, and north is along -Z. The front facade is at Z = 0 and the building
extends to Z = -depth.

Overall height is:

    height = floors × floorHeight

Facade bay width is:

    bayWidth = width / bays

Each opening is centred in a facade bay. Opening width may not exceed 72% of the
current bay width. Sill height plus opening height must leave at least 0.25 m below
the floor above. The cutaway value is a display ratio from 0 to 0.8; it removes the
right-hand portion of the front/roof representation so floor plates remain visible.

This is geometry for visualization and composition. It does not determine structural
capacity, fire rating, accessibility compliance, egress compliance, or jurisdictional
building-code compliance.

## Usage

The demo entrypoint is assets/buildings/bld-building-envelope/demo/index.html.
The reusable module is src/asset.mjs and exports createAsset(context).

The runtime supports setParameters, update, reset, resize, snapshot, and idempotent
dispose. update accepts absolute time in seconds but this asset is intentionally
static. The component has no network dependency and no third-party runtime package.

## Reuse and rights

The source is original repository work and contains no embedded third-party models,
textures, fonts, or datasets. Repository MIT licensing applies.

## Review evidence

REVIEW.md records the current candidate review. previews/default.svg is a static
reference rendering of the default parameter set, not a substituted browser
screenshot. A live browser capture and independent review remain required before
promotion from candidate.

## Change history

- 0.1.0: Initial parametric envelope component and demo.
