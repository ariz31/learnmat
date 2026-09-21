# Support reactions and restraints

Status: candidate.

## Learning objective

Compare the idealized planar constraints of pin, roller, and fixed supports and identify the reaction components each support may develop.

## Model and assumptions

This asset is a **constraint diagram**, not a solved equilibrium problem. Reaction arrows show admissible positive reaction components associated with restrained degrees of freedom; they do not claim the actual sign or magnitude for a particular loading case.

Planar degrees of freedom are translation in x, translation in y, and rotation about z.

| Support | Restrained DOF | Possible reactions |
| --- | --- | --- |
| Pin | x, y | Rx, Ry |
| Roller on horizontal surface | y | Ry |
| Fixed | x, y, rz | Rx, Ry, Mz |

The roller shown assumes a horizontal bearing surface. A roller on an inclined surface would restrain translation normal to that surface instead.

## Usage

Entrypoint: `demo/index.html`. Reusable module: `src/asset.mjs`.

The component implements runtime v1 with `setParameters`, `update`, `reset`, `resize`, `snapshot`, and idempotent `dispose`. It has no network or third-party runtime dependency.

Parameters:
- `supportType`: `pin`, `roller`, or `fixed`.
- `showReactionDirections`: toggles symbolic positive reaction components.

`update(timeSeconds)` accepts finite nonnegative time but the diagram is static and time-independent.

## Reuse and rights

Original repository contribution. MIT license applies through the repository root `LICENSE`. No external images, fonts, models, or libraries are embedded.

## Review evidence

See `REVIEW.md`. The checked-in SVG preview is source-authored and representative; a browser screenshot and assistive-technology pass remain unavailable in this agent session.

## Change history

- 0.1.0 — Initial reusable support-restraint component.
