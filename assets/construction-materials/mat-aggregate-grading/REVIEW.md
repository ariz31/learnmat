# Asset review

- Asset ID/version: mat-aggregate-grading 0.1.0
- Reviewer/date: self-review, 2026-09-22
- Environment: source and arithmetic review only; browser execution not claimed
- Dependencies: none

## Engineering

- Percent passing is non-increasing as sieve opening decreases.
- Percent retained is computed from successive percent-passing differences.
- Pan retains the fraction passing the smallest modeled sieve.
- Default balanced retained percentages sum to 100%; for a 5 kg sample, retained mass sums to 5 kg.
- Particle symbols are explicitly decorative and not physically scaled.
- No grading envelope, acceptance criterion, or standard/project compliance claim is encoded.
- Gate: passed for source/arithmetic review.

## Browser/functionality

- Source provides create/set/update/reset/resize/snapshot/dispose.
- SVG is responsive; demo has a narrow-screen layout.
- Browser execution not performed.
- Gate: not-reviewed.

## Accessibility

- Native controls, visible focus, SVG accessible name, and text summary are present in source.
- Gate: not-reviewed with assistive technology.

## Rights

- Original repository contribution with no external dataset or media.
- Gate: cleared for original content.

## Decision

- Candidate only.
- Browser/responsive/assistive-technology review remains before approval.
