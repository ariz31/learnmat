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

## Pedagogy

- Learning objective covers curve reading, retained-fraction calculation, retained mass, closure checking, and correct interpretation.
- Governing relationships are visible before the result.
- Full intermediate retained fractions and masses are available through progressive disclosure.
- Live status provides the 100% and total-mass closure check.
- Focus mode hides instructional chrome while retaining the same component/model state.
- Default copy remains concise; detailed steps/table are collapsed until requested.
- Gate: passed for source/information-architecture review.

## Animation/presentation

- Animation is intentionally unnecessary: the concept is a static distribution and arithmetic relationship; motion would be decorative rather than explanatory.
- Focus/exit behavior is implemented at the demo layer and does not mutate model parameters.
- Escape exits focus mode.
- Browser state-restoration behavior has not been executed.
- Gate: source-reviewed; browser behavior not-reviewed.

## Browser/functionality

- Source provides create/set/update/reset/resize/snapshot/dispose.
- SVG is responsive; demo has a narrow-screen layout.
- Browser execution not performed.
- Gate: not-reviewed.

## Accessibility

- Native controls, visible focus, accessible focus button state, SVG accessible name, text summary, and a semantic details/table region are present in source.
- Gate: not-reviewed with assistive technology.

## Rights

- Original repository contribution with no external dataset or media.
- Gate: cleared for original content.

## Decision

- Candidate only.
- Browser/responsive/focus-state/assistive-technology review remains before approval.
