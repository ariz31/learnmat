# Contributing

## Task lifecycle

Before changing tracked repository content, document the requested work in the root
task ledger and follow [docs/AGENT-TASK-LIFECYCLE.md](docs/AGENT-TASK-LIFECYCLE.md).
Check active tasks and open pull requests before creating a new task.

Implementation contributions use one task ID, one task branch, and one implementation
PR. The PR must stay within the task's declared write scope. Record unrelated work as
a separate TODO instead of expanding the current PR.

Use `python scripts/task.py validate` before handoff. Specialized domain-agent work
continues to follow `docs/AGENT-ORCHESTRATION.md`; its integrator maintains the root
task lifecycle when worker scope excludes the root task folders.

## Intake

Create a stable kebab-case asset ID, choose a category from docs/TAXONOMY.md,
and record where the work came from. Keep uploaded source unchanged in examples/
when it is a complete presentation. An extracted reusable component belongs in
assets/. Each record needs asset.json and a README describing intended use.
Use templates/asset-metadata.json and templates/ASSET-README.md as starting points.

## Development and review

1. Confirm source rights and dependency licenses before public reuse.
2. Define the learning objective, engineering model, assumptions, expected behavior,
   and the learner's required observation or conclusion before implementation.
3. If the subject has an actual procedure or calculation, design the walkthrough
   before the animation: show meaningful inputs, conventions, governing relation,
   intermediate results, visual consequence, check, and conclusion. Do not jump
   from raw inputs to a polished final answer.
4. Keep visible copy minimal. Use concise labels and progressive disclosure for
   derivations, assumptions, longer explanations, and tables.
5. For interactive/animated work, provide a focus/maximize presentation mode that
   hides steps and nonessential panels while retaining an obvious exit and essential
   animation controls. The focused view must remain responsive and understandable.
6. Design every curated primary visualization as real Three.js 3D. Use actual
   spatial geometry, perspective/depth, meaningful camera framing, and purposeful
   object relationships similar in visual ambition to the surveying examples.
   Flat SVG/raster/Canvas2D output may appear only as an analytical overlay within
   the 3D lesson, never as the curated asset's primary renderer.
7. Extract reusable geometry, calculations, or scene controls without importing
   presentation-specific global IDs or unscoped CSS into the consumer.
8. Make animation purposeful, smooth, deterministic where practical, and consistent
   with the authoritative model. Avoid decorative motion.
9. Provide a minimal usage example and documented lifecycle cleanup.
10. Keep `previewImage: null` and do not add static catalog preview files. If a
    rendered capture is needed for review evidence, record its source version,
    viewport, and state outside the runtime asset catalog.
11. Complete templates/REVIEW.md and the checks in docs/QUALITY.md and
    docs/EDUCATIONAL-DESIGN.md.
12. Update catalog/catalog.json when working in the authorized integrator workflow;
    run `python scripts/validate_catalog.py`.
13. Open a focused change with evidence and known limitations. Do not run GitHub
    Actions. Merge and deployment depend on the authorized repository workflow.

## Testing policy

Keep LearnMat intentionally light on automated tests. Do not create unit,
integration, or E2E suites as routine scaffolding, coverage work, or a default
response to each change. Prefer the catalog validator, independent numerical
spot-checks, targeted browser/manual inspection, and build/runtime verification.

Add an automated test only when a change protects genuinely critical behavior
and a simpler check would not give adequate confidence. Examples include high-risk
engineering calculations, data integrity, security boundaries, or a severe
regression likely to recur. Keep such tests narrowly scoped and document why they
are necessary. Do not add broad test infrastructure merely to support one check.

## Corrections and provenance

Keep the original asset ID stable. Record derivation and revisions. A mathematical
correction must explain the previous error, affected outputs, and reference or
independent check supporting the fix. Do not replace historical evidence with a
new result under the same label. Use templates/IMPROVEMENT.md for issue reports.

## Review states

Draft or intake work can be contributed before all review gates pass. It must stay
clearly marked candidate. Only reviewed, rights-cleared assets enter the public
reuse catalog. See docs/ASSET-CONTRACT.md for the exact release gates.

## Five-agent contributions

New parallel contributors use the [orchestration guide](docs/AGENT-ORCHESTRATION.md).
Do not edit the shared catalog in worker branches. New assets are discovered from
assets/<category>/<reserved-id>/asset.json; catalog/catalog.json remains the
legacy intake index. The integrator generates .build/catalog.json on demand.
