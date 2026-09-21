# Asset review

- Asset ID and version: bld-building-envelope 0.1.0
- Source commit or source hash: candidate branch; final merge SHA to be supplied by Git
- Reviewer and review date: buildings contributor self-review, 2026-09-22
- Environment/browser/device/viewport: source-level review only; live browser not available in this contribution path
- Dependencies available: none required

## Engineering

- Model, units, assumptions, and references: SI metres; right-handed +Y up, +X right/east, north -Z; geometry relationships are documented in README.md and checks/geometry.md.
- Independent calculation with inputs, expected result, actual result, tolerance: default 4 floors × 3.2 m = 12.8 m total height; 18 m / 4 bays = 4.5 m bay width; source equations match exactly.
- Boundary/invalid-input checks: model rejects non-finite values, out-of-range parameters, non-integer floor/bay counts, overly wide openings, and openings that violate the 0.25 m head clearance rule.
- Diagram and numerical agreement: source maps displayed dimensions from the same model values; live rendered verification remains pending.
- Gate: not-reviewed for release; self-check completed only.

## Browser and functionality

- Start, sequence, pause/resume, reset, repeated actions: implementation is static and deterministic; reset and repeated parameter changes are implemented.
- Resize, mobile/touch, dependency failures: responsive SVG and narrow demo layout are implemented; no third-party dependencies exist.
- Resource cleanup and multiple-instance behavior where applicable: component state is per-instance and dispose removes its owned root; browser observation remains pending.
- Gate: not-reviewed.

## Accessibility

- Keyboard, focus, labels, contrast, text equivalents: native labeled form controls and SVG title/description are present; source-only inspection performed.
- Reduced-motion behavior: asset is static; reduced-motion media query suppresses any inherited smooth behavior.
- Gate: not-reviewed.

## Rights

- Original source and permission/license evidence: original contribution in MIT-licensed repository.
- Embedded/third-party content and notices: none.
- Gate: cleared for original source; approval still requires independent technical review.

## Visual evidence

- Actual preview file: previews/default.svg
- Source version, inputs, animation state, viewport, capture procedure: the file is a deterministic static reference rendering of defaults (18 × 12 m, 4 floors, 3.2 m/floor, 4 bays, cutaway 0.36). It is not claimed as a browser screenshot.

## Decision

- Defects and severity: no known source-level geometry defect recorded.
- Unavailable checks: live browser behavior, responsive visual capture, interactive accessibility inspection, and independent engineering review.
- Release eligible: no; keep status candidate.
- Follow-up work: capture a real browser screenshot, run independent browser/accessibility review, and compare rendered dimensions against snapshot output before approval.
