# Asset review

- Asset ID and version: mat-steel-sections 0.1.0
- Source commit or source hash: candidate PR source; exact integration commit assigned by GitHub
- Reviewer and review date: self-review, 2026-09-22
- Environment/browser/device/viewport: source review only; no browser execution claimed
- Dependencies available: no runtime dependencies

## Engineering

- Model, units, assumptions, and references: SI geometry only. I-section/channel area uses 2*b*tf + (d - 2*tf)*tw. Angle area uses t*(Lx + Ly - t). Sharp-corner geometry intentionally omits fillets, taper, tolerances, and standard-section details.
- Independent calculation with inputs, expected result, actual result, tolerance: Default I-section area = 0.005808 m² = 5808 mm². Default angle area = 0.001900 m² = 1900 mm². See checks/geometry.md.
- Boundary/invalid-input checks: Source rejects non-finite/out-of-range dimensions, unknown parameters, impossible flange-depth relationships, web width greater than flange width, and angle thickness greater than either leg.
- Diagram and numerical agreement: Dimension labels and area snapshot derive from the same validated parameter state. The diagram is proportional to idealized geometry but is not a fabrication drawing.
- Gate: passed for source/formula review; runtime execution remains separate.

## Browser and functionality

- Start, sequence, pause/resume, reset, repeated actions: Source provides deterministic create/set/update/reset/snapshot/dispose methods; browser execution not performed.
- Resize, mobile/touch, dependency failures: Responsive SVG and a mobile single-column demo are present; not browser-verified.
- Resource cleanup and multiple-instance behavior where applicable: Each instance owns one root element and no timers, network calls, global keyboard handlers, or shared mutable state. Dispose removes the root idempotently.
- Gate: not-reviewed in a browser.

## Accessibility

- Keyboard, focus, labels, contrast, text equivalents: Native labelled controls, visible focus styles, component group label, SVG label, and text summary are implemented in source.
- Reduced-motion behavior: Asset is static and defines a reduced-motion fallback.
- Gate: not-reviewed with assistive technology.

## Rights

- Original source and permission/license evidence: Original repository contribution under repository MIT license.
- Embedded/third-party content and notices: None; no standard/manufacturer tables or third-party geometry imported.
- Gate: cleared for original contribution content.

## Visual evidence

- Actual preview file: previews/default.svg
- Source version, inputs, animation state, viewport, capture procedure: Static SVG reference render for the default 300 mm × 150 mm idealized I-section. Not represented as a browser screenshot.

## Decision

- Defects and severity: No formula, scope, or metadata defect found in source review.
- Unavailable checks: Browser execution, phone/tablet visual inspection, keyboard traversal in a browser, assistive-technology verification.
- Release eligible: no; keep candidate until independent browser/accessibility review.
- Follow-up work: Independently execute the demo, compare snapshots to checks/geometry.md, inspect all three shapes across responsive widths, and capture browser evidence before approval.
