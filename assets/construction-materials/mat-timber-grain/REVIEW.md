# Asset review

- Asset ID and version: mat-timber-grain 0.1.0
- Source commit or source hash: candidate PR source; exact integration commit assigned by GitHub
- Reviewer and review date: self-review, 2026-09-22
- Environment/browser/device/viewport: source review only; no browser execution claimed
- Dependencies available: no runtime dependencies

## Engineering

- Model, units, assumptions, and references: SI dimensions and radians at the API boundary. Grain direction unit vector is (cos θ, 0, -sin θ), with positive θ from +X toward -Z on the displayed top surface. Volume is length × width × thickness.
- Independent calculation with inputs, expected result, actual result, tolerance: For 0.300 × 0.075 × 0.025 m, expected volume is 0.0005625 m³ = 562.5 cm³. For θ=8°, expected direction ≈ (0.990268, 0, -0.139173). See checks/geometry.md.
- Boundary/invalid-input checks: Source rejects unknown parameters, non-finite values, dimensions outside documented limits, grain angles outside ±π/4, unsupported density values, and non-boolean toggles before mutation.
- Diagram and numerical agreement: Grain lines and orientation arrow use the same validated angle state. Grain density changes appearance only; it does not change geometry or imply physical grain spacing.
- Gate: passed for source/formula review; runtime execution remains separate.

## Browser and functionality

- Start, sequence, pause/resume, reset, repeated actions: Source provides deterministic create/set/update/reset/snapshot/dispose behavior; browser execution not performed.
- Resize, mobile/touch, dependency failures: Responsive SVG and a mobile single-column demo are present; not browser-verified.
- Resource cleanup and multiple-instance behavior where applicable: No timers, network calls, global keyboard handlers, global SVG IDs, or shared mutable component state. Dispose removes the owned root idempotently.
- Gate: not-reviewed in a browser.

## Accessibility

- Keyboard, focus, labels, contrast, text equivalents: Demo uses native labelled controls and visible focus styles. Component has a group label, SVG image label, and textual geometry/orientation summary.
- Reduced-motion behavior: Asset is static and defines a reduced-motion fallback.
- Gate: not-reviewed with assistive technology.

## Rights

- Original source and permission/license evidence: Original repository contribution under repository MIT license.
- Embedded/third-party content and notices: None; no species image, texture, grading table, or external dataset is used.
- Gate: cleared for original contribution content.

## Visual evidence

- Actual preview file: previews/default.svg
- Source version, inputs, animation state, viewport, capture procedure: Static SVG reference render of the default 300 × 75 × 25 mm specimen with an 8° stylized surface-grain indicator. Not represented as a browser screenshot.

## Decision

- Defects and severity: No geometry, angle-unit, scope, or metadata defect found in source review.
- Unavailable checks: Browser execution, phone/tablet visual inspection, keyboard traversal in a browser, assistive-technology verification.
- Release eligible: no; keep candidate until independent browser/accessibility review.
- Follow-up work: Independently execute the demo, compare snapshots to checks/geometry.md, inspect positive/negative grain angles and responsive widths, and capture browser evidence before approval.
