# Five asset-contributor prompts

Use one prompt per dedicated agent/worktree. These are bounded implementation
prompts, not background services.

| Agent | Prompt | Initial queue |
| --- | --- | --- |
| Structures | [structures.md](structures.md) | 8 structural/member-response assets |
| Materials | [materials.md](materials.md) | 8 material/specimen assets |
| Surveying | [surveying.md](surveying.md) | 8 people/instrument/field-action assets |
| Buildings | [buildings.md](buildings.md) | 8 building/assembly/service assets |
| Water and ground | [water-ground.md](water-ground.md) | 8 hydraulic/soil/ground assets |

## Shared production bar

All five prompts now use the same non-negotiable standard:

**The best current surveying 3D assets are the minimum visual-quality reference for
new spatial work.**

That means a new asset should not be considered ready merely because it renders,
computes correctly, or uses a 3D library. It must be a coherent educational 3D
experience with recognizable geometry, deliberate camera composition, useful scene
context, depth, appropriate materials/lighting, purposeful animation, minimal
instructional chrome, focus/maximize presentation, responsive behavior, and real
visual review evidence.

A flat SVG, Canvas2D scene, faux-isometric drawing, or collection of generic
primitives is not an acceptable shortcut for a spatial task. A 2D-primary exception
must have a concrete educational justification in the asset documentation and
`spatial3d` review evidence. Exact 2D equations, plots, dimensions, tables,
sections, and annotations remain encouraged as analytical companions to the 3D
scene.

Every prompt also requires an adversarial compare-and-improve pass before handoff:
if the new asset would visibly look unfinished, flatter, more generic, less coherent,
or less classroom-ready beside the strongest surveying references, the worker must
improve it within the task budget or block honestly when the required rendered
evidence cannot be established.

Engineering correctness, pedagogy, accessibility, rights, and runtime discipline
remain independent gates. Matching the surveying visual quality does not copy or
inherit the surveying assets' correctness or review status.

Read [the educational design standard](../../docs/EDUCATIONAL-DESIGN.md) and
[the orchestration guide](../../docs/AGENT-ORCHESTRATION.md) before launching a
worker. Each run starts at most 3 new tasks per agent and each task receives at most
3 total implementation attempts. The integrator performs independent review and
serial integration.