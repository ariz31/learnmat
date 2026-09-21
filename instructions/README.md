# AI instruction library

Read ../AGENTS.md and ../docs/EDUCATIONAL-DESIGN.md first. These workflows are
repository guidance that an assistant can read through ordinary file or GitHub
access; they are not an installed skill.

All asset work is educational-first and 3D-first. Preserve accurate meaningful
procedural steps when a real procedure exists, keep default visible text minimal,
make animation serve learning, and provide a focus/maximize animation-only
presentation mode for interactive/animated lessons whenever practical. New spatial
assets should use real 3D geometry and scene depth by default, taking visual
direction from the surveying examples. Use a 2D-primary presentation only with a
clear educational justification.

| Task | Workflow |
| --- | --- |
| Find or show an existing asset | [SHOW-ASSET.md](SHOW-ASSET.md) |
| Build a single-HTML lesson using an asset | [REUSE-ASSET.md](REUSE-ASSET.md) |
| Improve an asset or fix a defect | [IMPROVE-ASSET.md](IMPROVE-ASSET.md) |
| Add a supplied source | [INGEST-ASSET.md](INGEST-ASSET.md) |

Read only the relevant asset and workflow, then follow its linked model/review
documents. Do not load every presentation just to search the catalog.

## Domain production agents

Use [the five prompts](agents/README.md) and the
[orchestration guide](../docs/AGENT-ORCHESTRATION.md) for isolated, bounded asset
production. These are invoked task prompts, not scheduled background services.
