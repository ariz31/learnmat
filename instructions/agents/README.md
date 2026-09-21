# Five asset-contributor prompts

Use one prompt per dedicated agent/worktree. The prompts execute bounded task loops;
they do not install or schedule agents. Scaffold integration must precede launches.

| Agent | Prompt | Initial queue |
| --- | --- | --- |
| Structures | [structures.md](structures.md) | 8 member/response assets |
| Materials | [materials.md](materials.md) | 8 specimens/catalog assets |
| Surveying people and equipment | [surveying.md](surveying.md) | 8 actors/instruments |
| Buildings | [buildings.md](buildings.md) | 8 assemblies/site/service assets |
| Water and ground | [water-ground.md](water-ground.md) | 8 hydraulic/soil assets |

Every agent follows [the educational design standard](../../docs/EDUCATIONAL-DESIGN.md):
assets must teach a meaningful concept or procedure; real procedures should expose
accurate meaningful steps and intermediate reasoning as far as practical; visible
copy should remain minimal through progressive disclosure; and interactive/animated
demos should provide a focus/maximize mode that can show the animation without
lesson panels while preserving essential controls and a clear exit. Animation must
serve learning rather than decoration.

Read [the orchestration guide](../../docs/AGENT-ORCHESTRATION.md) for setup, state
transitions, interruption recovery, and integration. All 40 tasks are reserved
backlog entries, not already implemented assets. Each run starts at most 3 tasks
per agent; at most 3 implementation attempts per task. Continue additional runs
only after the integrator reviews and integrates or resolves the prior run.
