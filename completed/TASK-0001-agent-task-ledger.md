---
id: TASK-0001
title: Establish repository task ledger for agentic swarm coordination
status: completed
priority: high
created: 2026-09-24
completed: 2026-09-24
claimed_by: chatgpt
branch: task/TASK-0001-agent-task-ledger
pr: 37
coordination: shared
block_reason: null
write_scope:
  - AGENTS.md
  - CONTRIBUTING.md
  - docs/AGENT-TASK-LIFECYCLE.md
  - todo/**
  - implementing/**
  - completed/**
  - templates/TASK.md
  - scripts/task.py
read_scope:
  - orchestration/**
  - scripts/**
  - docs/**
forbidden_scope:
depends_on:
conflicts_with:
---

## Objective

Introduce a repository-wide task ledger and claim protocol so multiple AI or human
contributors can work concurrently with low duplication and low merge-conflict risk.

## Current problem

LearnMat already has specialized asset orchestration, ownership queues, and worker
scope checks, but general repository work has no universal task lifecycle tying
requests, ownership, branches, and pull requests together.

## Acceptance criteria

- Every meaningful implementation is documented before source changes begin.
- Root task states exist for available, claimed, and historical work.
- Exactly one active implementation and one implementation PR are allowed per task.
- Each implementation PR maps to exactly one task ID.
- Agents inspect active tasks and open PRs before claiming work.
- Task files declare write scope, dependencies, conflicts, validation, and boundaries.
- Unrelated discoveries become new TODOs rather than scope creep.
- Existing asset orchestration remains authoritative for domain-worker ownership.
- A local helper validates task metadata/state and supports safe transitions without
  GitHub Actions.

## Out of scope

- Replacing orchestration/owners.json or domain queues.
- Adding or triggering GitHub Actions.
- Automatically merging implementation pull requests.
- Claiming that Git files provide a distributed remote lock.

## Validation required

- Run the task-ledger validator against the branch state.
- Confirm AGENTS.md and CONTRIBUTING.md point to the same lifecycle.
- Confirm the bootstrap task itself follows the lifecycle and records PR #37.
- Inspect the final PR for one-task-only scope and no unrelated changes.
- Verify the helper's new, claim, set-pr, status, close, and validate transitions.

## Notes

This is the bootstrap task for the task-ledger protocol itself. It was first created
under todo/ before substantive implementation, then claimed into implementing/ and
linked to draft PR #37.

## Implementation summary

- Added root todo, implementing, and completed ledgers with explicit semantics.
- Added a reusable task template and collision-resistant future task IDs.
- Added a stdlib-only task helper/validator with scope-overlap and dependency checks.
- Added repository-wide mandatory preflight/claim rules to AGENTS.md.
- Integrated the general ledger with the existing specialized asset orchestration.


## Validation evidence

- PR #37 changed-file audit: 9 files, all within TASK-0001 declared scope.
- Task helper syntax and lifecycle logic were exercised in an isolated local fixture:
  create, claim, set-pr, validate, release, reclaim, ready, complete, cancellation,
  and semantic-conflict rejection all passed.
- Critical validator/claim/release code was re-read from the actual PR branch after
  the hardening patches.
- Vercel preview for head 71794a5f599fe9c9aa048403e298b9a90b8376a7 reported Ready.
- No GitHub Actions workflow was added or manually triggered.


## Completion

- Authorized for merge by the repository owner on 2026-09-24.
- Task lifecycle closed in this PR immediately before merge.
