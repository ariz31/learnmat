# Reuse in a single-HTML lesson

Read docs/REUSE.md, docs/EDUCATIONAL-DESIGN.md, and the selected asset's README,
metadata, and model source. Identify whether the user needs offline, CDN-dependent,
or hosted delivery. Check rights and review state. A candidate can be a development
reference, but must not be presented as an approved public asset.

Keep the engineering model separate from lesson copy and UI. For spatial subjects,
preserve or build a real 3D primary scene rather than flattening the lesson into
SVG/Canvas2D for convenience. Use the surveying examples as visual direction for
camera, depth, environmental context, and animated action. Exact 2D analytical
overlays remain encouraged. A 2D-primary result needs a clear educational reason. Preserve the asset's
units, conventions, assumptions, and limits. If the lesson represents a real
calculation or procedure, teach the meaningful sequence instead of showing only the
final answer: data, conventions, governing relationship, intermediate reasoning,
visual consequence, check, and conclusion as applicable.

Keep the default presentation visually light. Use concise labels and progressive
disclosure for detailed derivations, tables, assumptions, and explanatory text.
For interactive or animated lessons, provide a focus/maximize mode that can hide
steps and explanatory chrome so the animation is presentation-ready by itself,
while retaining an obvious exit and essential pause/play/reset controls.

Scope styles and DOM selectors, pin dependencies, include required credits and a
clear network requirement, and avoid unrelated global event listeners. Validate
the relevant numerical example, purposeful animation states, controls, focused
presentation mode, narrow-screen layout, reduced-motion behavior, and reset/resize.
Describe untested limits in the result.

Suggested request: “Use an appropriate LearnMat asset to create one educational
single-HTML lesson. Keep visible text minimal, show the actual procedure where one
exists, and include a focus mode that shows the animation without lesson panels.”
