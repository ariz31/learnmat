# Asset review

- Asset ID and version: mat-masonry-units 0.1.0
- Reviewer/date: self-review, 2026-09-22
- Environment: source and arithmetic review only; browser execution not claimed
- Dependencies: none

## Engineering

- SI rectangular-prism geometry with rectangular through-voids.
- Default gross volume: 0.0120 m³.
- Default total void volume: 0.00432 m³.
- Default idealized solid volume: 0.00768 m³.
- Validation prevents non-finite/out-of-range dimensions, impossible void depth, excessive combined void length, unsupported view, and invalid void count.
- Running bond is explicitly schematic and is not a wall-design prescription.
- Gate: passed for source/formula review.

## Browser and functionality

- Source provides create/set/update/reset/resize/snapshot/dispose.
- SVG is responsive and demo has a narrow-screen layout.
- Browser execution not performed.
- Gate: not-reviewed.

## Accessibility

- Native labelled form controls, visible focus styles, SVG accessible name, and text summary are present in source.
- Gate: not-reviewed with assistive technology.

## Rights

- Original repository contribution; no third-party product geometry or media.
- Gate: cleared for original content.

## Visual evidence

- Preview: `previews/default.svg`
- Static default-state reference render only; not represented as a browser screenshot.

## Decision

- Candidate only.
- No geometry or scope defect found in source review.
- Browser/responsive/assistive-technology checks remain before approval.
