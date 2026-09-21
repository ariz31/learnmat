# Repository architecture

## Current directories

| Path | Responsibility |
| --- | --- |
| README.md, AGENTS.md, CONTRIBUTING.md | Entry points and contributor rules |
| docs/ | Product, engineering, reuse, hosting, and rights specifications |
| instructions/ | Task-specific workflows for AI assistants |
| catalog/catalog.json | Index of all records, including internal intake candidates |
| catalog/provenance.json | Input and extracted-file byte hashes |
| schemas/asset.schema.json | Machine-readable metadata contract |
| examples/surveying/<id>/ | Supplied complete HTML, metadata, and intake README |
| templates/ | Starting points for new metadata, usage docs, reviews, and issues |
| scripts/validate_catalog.py | Dependency-free structural validation |

## Planned directories

`assets/<category>/<id>/` will hold curated reusable source, asset.json, README.md,
preview images, and review evidence. `site/` will hold the public gallery when
implemented. Do not create dummy application code merely to fill this structure.

The canonical metadata remains beside each asset. The root catalog is an index
of IDs and metadata paths. A future build reads and validates this index, emits a
public catalog containing approved records only, and copies approved distributable
files into the output. Never serve the entire repository root as production output.

## Runtime boundaries

Keep the gallery UI separate from untrusted asset execution. The gallery consumes
metadata as data and renders ordinary text safely. Interactive samples run in a
restricted preview environment described in HOSTING.md. Gallery search and cards
must work without creating every scene or loading every 3D library.

Reusable components should separate the engineering model, renderer, and lesson
UI. The future component contract should support initialization, explicit parameter
updates, pause/resume, reset, deterministic capture, and disposal. The supplied
HTML examples do not claim to implement a common component API.

## Source and publication

Git is the source of truth. Public files are build artifacts from a specific
commit. Avoid direct UI edits to deployed assets that bypass source review.
Use stable asset IDs with explicit versions, and retain older public versions
where consumers depend on immutable URLs. A screenshot belongs to one source
version and capture state, not to an unversioned visual promise.

## Five-agent scaffold

The new assets/ layout is populated by reserved tasks, not placeholder catalog
entries. orchestration/ owns assignments and immutable queues; work/<agent>/<id>/
holds task state/evidence; contracts/ defines the reusable runtime. Each agent uses
a distinct Git worktree. Workers do not edit shared registries. The generator
combines the legacy catalog with discovered asset.json files into ignored .build/.
See [AGENT-ORCHESTRATION.md](AGENT-ORCHESTRATION.md) for command usage and limitations.
