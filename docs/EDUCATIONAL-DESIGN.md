# Educational asset design standard

LearnMat is an educational repository, not a gallery of decorative engineering
graphics. Every curated asset should help a learner understand, observe, compute,
compare, or perform something meaningful. Engineering correctness remains the
first gate; educational clarity and animation quality are additional requirements,
not substitutes for correctness.

## Educational-first rule

Every new or substantially revised asset should answer these questions in its
README, demo, or review evidence:

1. What should the learner understand or be able to do after using it?
2. What prior information, assumptions, units, conventions, and limits are needed?
3. What should the learner observe in the visual or animation?
4. How does the visual state connect to the governing model, equation, geometry,
   physical mechanism, or engineering decision?
5. What conclusion or check should the learner make at the end?

A static reference component may teach through labels, comparison, sectioning,
annotations, state changes, or inspection. Do not force artificial procedural
steps onto a concept that is not procedural.

## 3D-first visual standard

LearnMat prioritizes real 3D educational presentation. For new or substantially
reworked assets, begin from the assumption that the learner should see the object,
field procedure, system, experiment, structure, material, building, terrain, fluid,
or mechanism in a coherent 3D scene.

Use the current surveying examples as a preferred visual direction: recognizable
spatial equipment/objects, perspective camera, depth cues, contextual ground or
environment, purposeful camera framing, and animated actions that occur in space.
Those examples are references for visual ambition and scene composition only; their
candidate status does not establish engineering correctness, accessibility, rights,
or approval.

A primary visual is considered meaningfully 3D when it uses actual spatial geometry
and depth relationships, not merely a flat SVG with gradients, a 2.5D/isometric
drawing, or a perspective-styled card. Prefer real 3D meshes/geometry, a perspective
or intentionally chosen orthographic camera, lighting/material cues where useful,
and navigable or staged viewpoints when they improve understanding.

Use 2D as the primary visual only when one of these is documented in the review:
- the learning object is inherently planar or symbolic and depth adds no information;
- a graph, equation, diagram, or section must be read exactly in 2D;
- 3D would materially reduce engineering clarity, accessibility, or performance;
- the asset is a supporting overlay/component intended to be composed into a 3D lesson.

Even in a 3D-first asset, use 2D overlays freely for equations, plots, measurements,
labels, tables, vectors, section cuts, and step guidance. The 3D scene teaches the
spatial/physical system; the 2D layer communicates exact analytical information.

Do not downgrade a requested or spatially meaningful asset to SVG/Canvas2D solely
because it is faster to implement. If real 3D is practical and educationally useful,
it is the default.

## Step-by-step procedure when one exists

If an asset represents a calculation, field procedure, analysis sequence,
construction sequence, experiment, design workflow, or other ordered process,
teach the actual procedure as completely as practical. Do not jump directly from
inputs to a polished final answer.

A strong walkthrough normally includes:

1. **Problem or objective** — what is being determined or performed.
2. **Known data** — values, geometry, conditions, units, and source assumptions.
3. **Conventions** — axes, signs, directions, datum, coordinate/bearing convention,
   load direction, flow direction, or other domain-specific definitions.
4. **Governing relationship** — the equation, rule, geometric construction,
   physical principle, or decision criterion used in that step.
5. **Substitution or transformation** — show the actual intermediate quantities
   where doing so improves understanding.
6. **Intermediate result** — display the result with units and enough precision
   for the next step; round primarily for presentation, not internal calculation.
7. **Visual consequence** — animate or highlight the geometry/physical state that
   corresponds to the calculation or action.
8. **Check or interpretation** — conservation, closure, equilibrium, limiting
   behavior, reasonableness, code applicability, or other relevant validation.
9. **Final conclusion** — state what the result means, not only its number.

For long procedures, group closely related algebra into a readable substep rather
than displaying every trivial arithmetic operation. “As complete as practical”
means preserving the reasoning chain that a learner needs to reproduce or explain
the method, without creating needless visual clutter.

## Minimal-text information design

Educational completeness does not mean permanently showing all explanation.

- Keep the default view dominated by the engineering visual or animation.
- Use short labels, symbols, units, and one concise active-step explanation.
- Put derivations, long assumptions, tables, references, and secondary explanation
  behind progressive disclosure, expandable details, tooltips, or a dedicated
  calculation/details view.
- Avoid duplicating the same explanation in headers, cards, legends, and footers.
- Prefer a diagram annotation or highlighted relationship when it communicates the
  idea more clearly than a paragraph.
- On small screens, prioritize the visual and the active step; move secondary
  information below or behind disclosure rather than shrinking it into illegibility.

The learner must still be able to reach the complete reasoning where it is needed.

## Computation transparency

When numerical calculation is part of the learning objective:

- show the governing formula or algorithm before the result;
- identify every symbol and unit used in the current context;
- expose important intermediate values, transformations, and cumulative totals;
- keep displayed values derived from the same authoritative model as the drawing;
- use independent calculation or a trusted reference to verify representative
  examples before claiming correctness;
- distinguish exact values, internally retained precision, and displayed rounding;
- explain why a method is applicable and where it is not;
- surface closure/error/residual checks when the discipline provides them.

Do not use animation to hide a numerical method. A learner should be able to pause
the asset and understand how the current state was obtained.

## Animation standard

Animation should explain causality, sequence, scale, direction, or state change.
Decorative motion that does not improve understanding should be removed.

Where animation is useful, prefer:

- meaningful start and end states;
- visible progression tied to the procedure or governing model;
- pause/resume and replay/reset;
- direct stepping through instructional stages when the process has discrete steps;
- a timeline or clear current-step indicator for longer sequences;
- readable labels that remain attached to the object or value they explain;
- transitions that preserve spatial continuity rather than teleporting objects;
- deterministic states for the same inputs and time where practical;
- physically meaningful timing when timing itself is instructional;
- clearly labelled time/scale exaggeration when motion is accelerated, slowed, or
  visually amplified for teaching;
- responsive, touch-friendly presentation on desktop, tablet, and narrow mobile;
- a useful reduced-motion mode that still preserves the instructional sequence.

For spatial subjects, 3D is the default rather than an optional enhancement. Use
camera movement sparingly and purposefully; the learner should not fight the camera
to understand the lesson. High quality means clear, accurate, purposeful, smooth,
legible, spatially coherent, and stable—not merely visually busy.

## Focus/maximize presentation mode

Interactive or animated assets should provide a presentation mode that lets an
instructor maximize/focus the engineering visual and hide lesson steps, long
explanations, derivation panels, tables, and other nonessential chrome.

The focused mode should:

- maximize useful visual area without changing the engineering state;
- retain an obvious exit/back control;
- retain essential pause/play and reset/replay controls when animation uses them;
- keep critical units, safety/assumption warnings, or indispensable labels visible
  when hiding them would make the animation misleading;
- avoid resetting parameters, simulation time, camera state, or current step merely
  because the view was maximized;
- restore the previous teaching view and instructional state on exit;
- work on desktop, tablet, and mobile;
- remain understandable with reduced motion.

Focus mode is not a second simulation. It is another presentation of the same
authoritative model and state.

## Learner interaction

Interaction should support inquiry rather than distract from the lesson. When
appropriate, let learners change inputs, drag geometry, scrub time, toggle layers,
inspect values, compare states, or answer a prediction before revealing the next
state. Recompute all dependent results from the same model after an input change.

Controls must make their consequence understandable. Avoid unlabeled sliders,
mystery buttons, excessive camera controls, or interactions that change geometry
without updating the associated calculations and explanations.

## Required review evidence

For a new agent-produced asset to be ready for independent review, its evidence
must cover all of the following:

- **engineering** — correctness of model, units, conventions, and representative results;
- **pedagogy** — learning objective, instructional sequence or concept explanation,
  intermediate reasoning where applicable, meaningful conclusion/check, and
  minimal-text information hierarchy;
- **functionality** — controls, reset, resize, invalid/boundary states, and lifecycle;
- **animation** — purpose, state continuity, pause/step/replay behavior where
  applicable, agreement between motion and the model, focus/maximize behavior,
  exit/state restoration, and reduced-motion behavior;
- **accessibility** — keyboard/focus/labels, text equivalents, and reduced motion;
- **spatial3d** — real 3D geometry/scene quality, depth/camera/material coherence,
  and justification for any 2D-primary exception;
- **visual** — legibility, hierarchy, responsive layout, and actual captured evidence;
- **reuse** — documented inputs/outputs, dependencies, limits, rights, and cleanup.

If an asset is intentionally static, the animation check should explicitly state
that animation is not educationally necessary and document the static teaching
mechanism instead of inventing decorative motion.

## Existing assets

Existing candidate or integrated assets are not automatically declared deficient
because this standard was introduced later. Apply it when an asset is substantially
revised, promoted toward approval, or selected for educational-quality improvement.
Prioritize assets that currently present a final visual without enough explanation,
procedure, computation, learner guidance, or presentation-quality focus behavior.
