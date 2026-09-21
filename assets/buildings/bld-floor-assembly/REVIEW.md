# Asset review

- Asset ID and version: bld-floor-assembly 0.1.0
- Source commit or source hash: candidate branch; final merge SHA supplied by Git
- Reviewer and review date: buildings contributor self-review, 2026-09-22
- Environment/browser/device/viewport: source-level review only; no live browser claim
- Dependencies available: none required

## Engineering

- Model, units, assumptions, and references: SI metres; right-handed +Y-up coordinates; assembly-layer geometry only.
- Independent calculation with inputs, expected result, actual result, tolerance: default physical build-up = 0.012 + 0.300 + 0.150 + 0.040 + 0.012 = 0.514 m; source uses the same direct sum.
- Boundary/invalid-input checks: all numeric parameters reject non-finite and out-of-range values before state replacement.
- Diagram and numerical agreement: layer labels are derived from the same model thickness values; live rendered comparison remains pending.
- Gate: not-reviewed for release; self-check completed only.

## Browser and functionality

- Start, sequence, pause/resume, reset, repeated actions: static deterministic component; reset and repeated parameter changes are implemented.
- Resize, mobile/touch, dependency failures: responsive SVG and narrow demo layout are implemented; no runtime dependencies exist.
- Resource cleanup and multiple-instance behavior where applicable: state is instance-local; no global SVG IDs or document-wide listeners; dispose is idempotent.
- Gate: not-reviewed.

## Accessibility

- Keyboard, focus, labels, contrast, text equivalents: native labeled controls plus SVG title/description and text summary are present in source.
- Reduced-motion behavior: no animation; reduced-motion state remains static.
- Gate: not-reviewed.

## Rights

- Original source and permission/license evidence: original contribution in MIT-licensed repository.
- Embedded/third-party content and notices: none.
- Gate: cleared for original source; independent technical review still required for approval.

## Visual evidence

- Actual preview file: previews/default.svg
- Source version, inputs, animation state, viewport, capture procedure: deterministic static default illustration; 6 × 4 m plan with 12/300/150/40/12 mm layer stack and 80 mm display gap. Not claimed as a live browser screenshot.

## Decision

- Defects and severity: no known source-level arithmetic defect recorded.
- Unavailable checks: live-browser rendering, responsive capture, interactive accessibility inspection, and independent engineering review.
- Release eligible: no; keep candidate.
- Follow-up work: verify browser rendering and labels against snapshot data, capture a real browser preview, and complete independent review before approval.
