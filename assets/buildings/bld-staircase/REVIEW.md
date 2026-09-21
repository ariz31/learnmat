# Asset review

- Asset ID and version: bld-staircase 0.1.0
- Source commit or source hash: candidate branch; final merge SHA supplied by Git
- Reviewer and review date: buildings contributor self-review, 2026-09-22
- Environment/browser/device/viewport: source-level review only; no live-browser claim
- Dependencies available: none required

## Engineering

- Model, units, assumptions, and references: SI metres; straight flight; upper floor is terminal walking surface; goings = risers - 1.
- Independent calculation with inputs, expected result, actual result, tolerance: 3.00 m / 17 = 0.176470588 m rise; 16 × 0.280 = 4.48 m run; atan2(3.00, 4.48) = 33.80796 degrees. Source formulas match these relationships.
- Boundary/invalid-input checks: total rise, going, width, and riser count are range-checked; non-finite values and non-integer riser counts are rejected before state replacement.
- Diagram and numerical agreement: dimension labels are derived from the same model; live rendered comparison remains pending.
- Gate: not-reviewed for release; self-check completed only.

## Browser and functionality

- Start, sequence, pause/resume, reset, repeated actions: static deterministic component; repeated parameter changes and reset are implemented.
- Resize, mobile/touch, dependency failures: responsive SVG/demo layout and dependency-free operation are implemented in source.
- Resource cleanup and multiple-instance behavior where applicable: no global IDs or document-wide listeners; state is instance-local; dispose is idempotent.
- Gate: not-reviewed.

## Accessibility

- Keyboard, focus, labels, contrast, text equivalents: native labeled controls, SVG title/description, and text summary are present.
- Reduced-motion behavior: no motion is used.
- Gate: not-reviewed.

## Rights

- Original source and permission/license evidence: original contribution in MIT-licensed repository.
- Embedded/third-party content and notices: none.
- Gate: cleared for original source; technical approval remains independent.

## Visual evidence

- Actual preview file: previews/default.svg
- Source version, inputs, animation state, viewport, capture procedure: deterministic static reference at default 3.00 m rise, 17 risers, 280 mm going, and 1.20 m width. Not claimed as a browser screenshot.

## Decision

- Defects and severity: no known source-level stair-count or arithmetic defect recorded.
- Unavailable checks: live-browser visual rendering, responsive capture, interactive accessibility review, and independent engineering review.
- Release eligible: no; keep candidate.
- Follow-up work: compare browser labels and profile against snapshot output and complete independent review before approval.
