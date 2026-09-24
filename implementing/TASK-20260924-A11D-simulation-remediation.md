---
id: TASK-20260924-A11D
title: Repository-wide simulation framing and runtime remediation
status: implementing
priority: critical
created: 2026-09-24
completed: null
claimed_by: chatgpt
branch: fix/visualization-framing-and-runtime
pr: 36
coordination: shared
block_reason: null
write_scope:
  - assets/**
  - shared/**
  - scripts/build_site.py
  - docs/VISUALIZATION-FRAMING-REVIEW.md
  - todo/**
  - implementing/**
  - completed/**
read_scope:
  - catalog/**
  - contracts/**
  - orchestration/**
  - docs/**
forbidden_scope:
depends_on:
conflicts_with:
---

## Objective

Audit and remediate all LearnMat interactive simulations in one PR so camera framing,
zoom/control placement, loading behavior, interaction controls, and runtime operation
are consistent, correctly positioned, responsive, and functional.

## Current problem

The supplied mobile recording shows inconsistent simulation framing and control
placement, including zoom/framing controls that do not reliably align with the
visualization surface. Some simulations also show prolonged or apparently stuck
empty/loading states. The prior PR #36 branch was stale relative to main and has been
reset to current main before this remediation.

## Acceptance criteria

- Inspect every simulation/demo in the current LearnMat catalog, not only those shown
  in the recording.
- Resolve shared camera/zoom/control-positioning defects centrally where possible.
- Fix per-simulation runtime defects discovered during the audit.
- No simulation remains indefinitely blank/loading under normal runtime conditions.
- Controls remain inside the simulation surface and usable at narrow/mobile widths.
- Camera Overview/Focus/Reset behavior preserves intentional learner framing and does
  not jump to invalid or off-model positions.
- All changed simulations remain technically/educationally correct.
- One PR contains the complete remediation with no duplicate implementation PR.

## Out of scope

- New unrelated visualization features.
- Replacing the LearnMat rendering architecture.
- GitHub Actions.
- Public asset promotion unrelated to these fixes.

## Validation required

- Inventory and source audit of all simulation demos.
- Reproduce video-observed defects from source/runtime evidence.
- Static/build validation for the complete repository.
- Browser/runtime verification where available, including narrow viewport checks.
- Final changed-file and scope audit.

## Notes

This task adopts existing PR #36 rather than opening a competing framing PR. The old
PR branch was reset to current main because it diverged across simulation files that
had already changed on main.
