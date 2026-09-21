# Aggregate grading visualization

Status: candidate.

This dependency-free SVG component combines an illustrative aggregate specimen with a percent-passing grading curve. It is a teaching asset, not a material acceptance tool.

## Learning objective

- Read percent passing against nominal sieve opening on a logarithmic horizontal axis.
- Relate changes in percent passing to percent retained and retained sample mass.
- Distinguish a grading visualization from a project or standard specification envelope.

## Data and assumptions

Nominal sieve openings (mm), descending:

`37.5, 25, 19, 12.5, 9.5, 4.75, 2.36, 1.18, 0.60, 0.30, 0.15`

The component contains three **illustrative** distributions:

- balanced: `100, 95, 85, 68, 55, 33, 20, 12, 7, 4, 2`
- coarse-heavy: `100, 90, 72, 48, 35, 18, 10, 6, 3, 1, 0`
- fine-heavy: `100, 99, 96, 90, 84, 68, 52, 38, 27, 18, 10`

These are not ASTM, AASHTO, DPWH, manufacturer, or project limits.

For each sieve:

`percent retained = previous percent passing - current percent passing`

The pan retains the fraction passing the smallest modeled sieve. Retained fractions, including pan, must sum to 100%.

For the default 5.00 kg balanced sample, retained percentages by sieve are:

`0, 5, 10, 17, 13, 22, 13, 8, 5, 3, 2`, plus **2% in the pan**.

Total retained mass = **5.00 kg**.

## Usage

Open `demo/index.html` from a local static server or import `src/asset.mjs`.

Parameters:

| Parameter | Default | Accepted |
| --- | --- | --- |
| `gradingPreset` | `balanced` | `balanced`, `coarse-heavy`, `fine-heavy` |
| `sampleMassKg` | 5 | 0.5–50 kg |
| `showParticles` | true | boolean |
| `showRetainedMass` | true | boolean |

The particle circles are deterministic decorative symbols and do not represent particle shape, angularity, density, or true scale.

## Reuse and rights

Original LearnMat contribution. No external grading table, specification envelope, product dataset, texture, or image is embedded. Repository license: MIT.

## Review evidence

- `previews/default.svg`
- `checks/grading.md`
- `REVIEW.md`

Browser and assistive-technology execution remain separate gates before approval.

## Change history

- 0.1.0 — Initial illustrative grading presets, retained-mass calculation, log-axis curve, and decorative aggregate specimen.
