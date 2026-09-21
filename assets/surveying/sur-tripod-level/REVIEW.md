# Asset review

- Asset ID and version: sur-tripod-level 0.1.0
- Source commit or source hash: to be recorded by integrator
- Reviewer and review date: self-review, 2026-09-22
- Environment/browser/device/viewport: source and static-preview review only; browser run not claimed
- Dependencies available: none

## Engineering

- Model: sight vector = (cos e sin A, sin e, -cos e cos A), with A clockwise from north.
- Independent checks: A=0,e=0 -> (0,0,-1); A=90°,e=0 -> (1,0,0); instrument station y equals instrumentHeight.
- Boundary checks: azimuth is limited to ±π at the API boundary; sight elevation to ±5°; all values must be finite.
- Diagram and numerical agreement: plan inset uses screen dx=sin(A), dy=-cos(A), matching north-up/east-right mapping.
- Gate: passed

## Browser and functionality

- Source exposes setParameters, absolute-time update, reset, resize, snapshot, and idempotent dispose.
- Browser interaction/resize execution was not independently run in this connector-only contribution.
- Gate: not-reviewed

## Accessibility

- SVG carries role=img and a descriptive aria-label; demo uses native labeled controls and a status region.
- The component has no autonomous motion, so reduced-motion does not remove information.
- Gate: not-reviewed

## Rights

- Original vector geometry and code; no third-party content.
- Gate: cleared

## Visual evidence

- Actual preview file: previews/default.svg
- Deterministic source-authored default view; no browser-screenshot claim.

## Decision

- No known engineering blocker.
- Release eligible: no; browser and assistive-technology gates remain open.
