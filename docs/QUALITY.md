# Quality and release review

## Engineering correctness

For each asset, record the objective, equations, input units and ranges, coordinate
system, assumptions, sign conventions, expected outputs, and applicability limits.
Use independently computed examples or authoritative references. Distinguish a
pedagogical simplification from a general method. Show rounding only at display
time. Label exaggerated deformation or vertical scale clearly.

Surveying-specific checks include:

| Example | Required checks before approval |
| --- | --- |
| Pace factor | Consistent step convention; retained-data calculation; explicit exercise-specific screening rule |
| Taping | Horizontal versus slope distance; alignment; correction assumptions and signs |
| Differential leveling | BS/FS sequence; HI and RL arithmetic; turning points; independent closure check |
| Profile leveling | Chainage units; vertical/horizontal scales; station elevations; grade and closure calculations |
| Compass traverse | Azimuth convention; latitude/departure signs; misclosure; Bowditch applicability and adjusted closure |

These are review targets, not findings or claims that the supplied examples pass.
Do not apply a code-specific requirement without naming its edition and scope.

## Functional and numerical review

Check initial state, full sequence, pause/resume, reset during animation, repeated
input, empty/invalid input, zero/extreme permitted values, resize, and resource
cleanup. Deterministic examples need fixed inputs or recorded states when
reproducibility matters. Check representative numerical results independently.

Do not add unit, integration, or E2E tests by default. Prefer structural validation,
manual/browser review, deterministic examples, and independent engineering
calculations. Introduce the smallest targeted automated test only when a critical
calculation, data-integrity boundary, security behavior, or severe recurring
regression cannot be verified adequately through those lighter methods.

## Visual and accessible delivery

Use readable labels, sufficient contrast, explicit units, and consistent visual
meaning. Keep panels clear of geometry and prevent clipped controls. Provide
keyboard access, visible focus, labeled buttons, and a text explanation of the
result. Color alone must not distinguish observations. Reduced-motion mode should
provide an understandable static or stepped state; pause and reset must remain
available. Check desktop, tablet, and narrow-phone widths, including landscape.

## Runtime and failure behavior

Record browser, viewport, device limitations, and dependency state. Verify missing
network dependencies, unsupported graphics, context loss when relevant, and
multiple mounts only when components claim to support them. Avoid loading every
interactive scene in catalog cards. Measure meaningful load/runtime costs on an
identified device; do not publish fabricated universal FPS scores.

## Evidence and decision

Complete templates/REVIEW.md with observed results and unresolved defects.
Screenshots need a source version, viewport, inputs, and capture state. Approval
requires engineering, browser, accessibility, and rights gates, plus reproducible
usage. A numeric quality score is optional and cannot override a failed gate.
This starter has structural validation only; no sample is approved.
