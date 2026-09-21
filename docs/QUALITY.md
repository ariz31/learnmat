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

## Educational correctness

Every curated asset must provide a meaningful learning outcome. Review
[EDUCATIONAL-DESIGN.md](EDUCATIONAL-DESIGN.md) together with the engineering model.

If a real procedure exists, verify that the learner can follow the reasoning chain
without guessing omitted steps: objective and known data, conventions, governing
relationship, meaningful intermediate work, visual consequence, a relevant check,
and the final interpretation. Do not require artificial steps for a purely
descriptive reference asset; in that case verify labels, comparisons, relationships,
assumptions, and the intended observation instead.

Keep instructional copy minimal in the default view. Detailed derivations may be
progressively disclosed, expanded on demand, or shown only for the active step.
Educational completeness belongs in the interaction and information architecture,
not in permanently visible walls of text.

## Animation and presentation quality

Animation must support understanding of causality, sequence, direction, scale, or
state change. Check that motion agrees with the same model that produces displayed
values, remains spatially continuous, and does not imply unsupported physics.
Acceleration, slow motion, deformation magnification, or other teaching
exaggerations must be labelled when they could otherwise be misread.

Interactive or animated assets should provide a focus/maximize mode that hides
lesson steps and nonessential explanatory chrome so the animation can be presented
alone. The focused view must keep a clear exit and essential pause/play/reset
controls, remain usable on desktop/tablet/mobile, and restore the prior lesson state
when closed. Reduced-motion users must retain an understandable stepped/static path.

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
meaning. Prefer concise labels and progressive disclosure over persistent prose.
Keep panels clear of geometry and prevent clipped controls. Provide
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
