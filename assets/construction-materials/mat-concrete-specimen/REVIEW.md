# Asset review

- Asset ID and version: mat-concrete-specimen 0.1.0
- Source commit or source hash: candidate PR source; exact integration commit assigned by GitHub
- Reviewer and review date: self-review, 2026-09-22
- Environment/browser/device/viewport: source review only; no browser execution claimed
- Dependencies available: no runtime dependencies

## Engineering

- Model, units, assumptions, and references: Pure Euclidean specimen geometry in SI units. Cylinder uses V=πr²h and A=2πr(h+r); cube uses V=s³ and A=6s². Appearance is explicitly illustrative and carries no material-property meaning.
- Independent calculation with inputs, expected result, actual result, tolerance: For d=0.15 m and h=0.30 m, expected cylinder volume 0.005301437602932776 m³ and surface area 0.17671458676442586 m². The implementation uses the same dimension definitions and direct formulas; see checks/geometry.md.
- Boundary/invalid-input checks: Source validation rejects non-finite values, dimensions outside documented bounds, unknown keys, invalid enum values, and non-boolean dimension toggles before parameter mutation.
- Diagram and numerical agreement: Dimension labels are produced from the same validated parameters used for the geometry snapshot. Drawn specimen proportions are pedagogical and not a scaled engineering drawing.
- Gate: passed for source/formula review; runtime execution remains separate.

## Browser and functionality

- Start, sequence, pause/resume, reset, repeated actions: Source implementation provides deterministic create/set/update/reset/snapshot/dispose methods; browser execution not performed in this review.
- Resize, mobile/touch, dependency failures: SVG is responsive and demo uses a single-column mobile breakpoint; not browser-verified.
- Resource cleanup and multiple-instance behavior where applicable: Each mount owns one section and dispose removes it idempotently. No timers, global keyboard capture, network dependencies, or shared mutable component state.
- Gate: not-reviewed in a browser.

## Accessibility

- Keyboard, focus, labels, contrast, text equivalents: Demo uses native labelled controls and visible focus styles. Component exposes a group label, SVG image label, and textual geometry summary. Assistive-technology behavior not executed.
- Reduced-motion behavior: Asset is static; CSS disables incidental animation/transition under reduced motion.
- Gate: not-reviewed with assistive technology.

## Rights

- Original source and permission/license evidence: Original repository contribution; intended for the repository MIT license.
- Embedded/third-party content and notices: None.
- Gate: cleared for original contribution content.

## Visual evidence

- Actual preview file: previews/default.svg
- Source version, inputs, animation state, viewport, capture procedure: Static SVG reference render matching the default 150 mm × 300 mm cylinder geometry and default component labels. It is not represented as a browser screenshot.

## Decision

- Defects and severity: No formula or metadata defect found in source review.
- Unavailable checks: Browser execution, narrow/mobile visual inspection, keyboard traversal in a browser, and assistive-technology verification.
- Release eligible: no; keep candidate until independent browser/accessibility review.
- Follow-up work: Independently run the demo in a browser, compare snapshot values against checks/geometry.md, inspect responsive layouts, and capture browser evidence before any approval.
