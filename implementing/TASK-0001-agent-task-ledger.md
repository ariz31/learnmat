---
id: TASK-0001
title: Establish repository task ledger for agentic swarm coordination
status: implementing
priority: high
created: 2026-09-24
claimed_by: chatgpt
branch: task/TASK-0001-agent-task-ledger
pr: pending
coordination: shared
scope:
  write:
    - AGENTS.md
    - CONTRIBUTING.md
    - docs/AGENT-TASK-LIFECYCLE.md
    - todo/**
    - implementing/**
    - completed/**
    - templates/TASK.md
    - scripts/task.py
  read:
    - orchestration/**
    - scripts/**
    - docs/**
  forbidden: []
depends_on: []
conflicts_with: []
---

## Objective

Introduce a repository-wide task ledger and claim protocol so multiple AI or human contributors can work concurrently with low duplication and low merge-conflict risk.

## Current problem

LearnMat already has specialized asset orchestration, ownership queues, and worker scope checks, but general repository work has no universal task lifecycle tying requests, ownership, branches, and pull requests together.

## Acceptance criteria

- Every meaningful implementation is documented before source changes begin.
- Root task states exist for available, claimed, and historical work.
- Exactly one active implementation and one implementation PR are allowed per task.
- Each implementation PR maps to exactly one task ID.
- Agents must inspect active tasks and open PRs before claiming work.
- Task files declare write scope, dependencies, conflicts, validation, and out-of-scope boundaries.
- Unrelated discoveries become new TODOs rather than scope creep.
- Existing asset orchestration remains authoritative for domain-worker ownership and is not replaced.
- A lightweight local helper validates task metadata/state and supports safe task creation/claim/completion transitions without GitHub Actions.

## Out of scope

- Replacing orchestration/owners.json or domain queues.
- Adding or triggering GitHub Actions.
- Automatically merging implementation pull requests.
- Building a remote lock service.

## Validation required

- Validate the task ledger with scripts/task.py.
- Confirm AGENTS.md and CONTRIBUTING.md point to the same lifecycle.
- Confirm the bootstrap task itself follows the lifecycle.
- Inspect the final PR for one-task-only scope and no unrelated changes.

## Notes

This is the bootstrap task for the task-ledger protocol itself. The task was documented in todo/ before substantive implementation and is now claimed in implementing/ on this branch.
