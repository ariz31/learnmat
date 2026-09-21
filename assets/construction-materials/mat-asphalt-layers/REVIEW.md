# Asset review

- Asset ID/version: mat-asphalt-layers 0.1.0
- Reviewer/date: self-review, 2026-09-22
- Environment: source and arithmetic review only; browser execution not claimed
- Dependencies: none

## Engineering

- Total thickness is the exact sum of the three generic layer thicknesses.
- Slab layer volumes use plan area × layer thickness.
- Core layer volumes use π(d/2)² × layer thickness.
- Default slab volumes are 4.80 L, 7.20 L, and 9.60 L; total 21.60 L.
- Default 100 mm diameter core total is 1.4137 L for 180 mm total thickness.
- Texture does not affect geometry or calculations.
- No pavement design, mixture property, density, compaction, or code/project compliance claim is encoded.
- Gate: passed for source/arithmetic review.

## Pedagogy

- Objective, known data, governing equations, intermediate layer fractions/volumes, checks, and interpretation are exposed.
- The visible formula precedes the result.
- Per-layer arithmetic is progressively disclosed in a table rather than permanently occupying the visual.
- Live checks verify both thickness and volume closure.
- Gate: passed for source/information-architecture review.

## Animation/presentation

- Animation is intentionally unnecessary because the concept is static layered geometry and arithmetic comparison.
- Focus mode hides instructional chrome without mutating the component state; Escape exits.
- Browser state restoration has not been executed.
- Gate: source-reviewed; browser behavior not-reviewed.

## Browser/functionality

- Runtime lifecycle methods are implemented; responsive SVG and narrow-screen demo CSS are present.
- Browser execution not performed.
- Gate: not-reviewed.

## Accessibility

- Native labelled controls, visible focus, accessible focus-button state, SVG accessible name, live status, and semantic details/table region are present in source.
- Gate: not-reviewed with assistive technology.

## Rights

- Original contribution with no third-party texture, mix data, or product media.
- Gate: cleared for original content.

## Decision

- Candidate only.
- Browser/responsive/focus/accessibility evidence remains before approval.
