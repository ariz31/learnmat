# Asset review

- Asset ID and version: str-frame-sway 0.1.0
- Reviewer and review date: structures self-review, 2026-09-22
- Environment/browser/device/viewport: source review only; browser execution unavailable
- Dependencies available: none

## Engineering

- Model: prescribed single-story portal-frame drift, fixed bases, rigid horizontal top beam.
- Independent check: 3.5 m × 0.015 = 0.0525 m = 52.5 mm.
- Boundary checks: zero drift produces zero displacement; display exaggeration does not modify physical snapshot geometry.
- Gate: not-reviewed independently

## Browser and functionality

- Runtime-v1 source and state flow inspected; live browser not executed.
- Gate: not-reviewed

## Accessibility

- Native labeled demo controls, SVG role/text equivalent, and visible numeric output included.
- Gate: not-reviewed

## Rights

- Original repository contribution; no embedded third-party content.
- Gate: cleared

## Visual evidence

- Actual preview file: previews/default.svg
- Source-authored representative preview; not a runtime screenshot.

## Decision

- Candidate only. Independent engineering/browser/accessibility review remains required before approval.
