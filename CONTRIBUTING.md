# Contributing

## Intake

Create a stable kebab-case asset ID, choose a category from docs/TAXONOMY.md,
and record where the work came from. Keep uploaded source unchanged in examples/
when it is a complete presentation. An extracted reusable component belongs in
assets/. Each record needs asset.json and a README describing intended use.
Use templates/asset-metadata.json and templates/ASSET-README.md as starting points.

## Development and review

1. Confirm source rights and dependency licenses before public reuse.
2. Describe the model and expected behavior before implementing an animation.
3. Extract reusable geometry, calculations, or scene controls without importing
   presentation-specific global IDs or unscoped CSS into the consumer.
4. Provide a minimal usage example and documented lifecycle cleanup.
5. Produce an actual preview image from a recorded state after implementation.
6. Complete templates/REVIEW.md and the checks in docs/QUALITY.md.
7. Update catalog/catalog.json; run `python scripts/validate_catalog.py`.
8. Open a focused change with evidence and known limitations. Do not run GitHub
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
