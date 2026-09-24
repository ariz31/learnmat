# Agent task lifecycle

This repository uses a root task ledger to coordinate concurrent human and AI contributors.
The ledger answers **what work exists, who owns it, and which PR carries it**. It does not
replace LearnMat's specialized asset orchestration under `orchestration/`.

## State directories

- `todo/` — documented, unclaimed work.
- `implementing/` — claimed work with one owner, one branch, and one draft/open PR.
  Valid statuses are `implementing`, `blocked`, and `ready`.
- `completed/` — immutable history for `completed`, `superseded`, or `cancelled`
  work. Never reuse a task ID.

A task keeps the same filename and ID while it moves between state directories.

## Non-negotiable invariants

1. No tracked implementation starts without a task record.
2. One task has at most one active owner, branch, and implementation PR.
3. One implementation PR maps to exactly one task ID.
4. Agents may not silently expand their declared write scope.
5. Unrelated defects or ideas discovered during implementation become separate TODOs.
6. Completed task records stay searchable; do not delete them after merge.
7. Refresh the current base and recheck active PRs immediately before claiming work.
   Repository files are cooperative coordination, not a distributed lock.

Read-only investigation, review, and answering questions do not require a task unless
they result in repository changes.

## Required preflight

Before creating or claiming work:

1. Read `AGENTS.md` and applicable nested guidance.
2. Refresh the current base branch.
3. Inspect `implementing/`.
4. Inspect open pull requests for the same feature, bug, paths, or task ID.
5. Inspect `todo/`.
6. Inspect `completed/` for prior equivalent work.
7. Inspect the current implementation and, for asset work, the relevant orchestration
   queue and ownership rules.
8. If equivalent work is already active, do not create another implementation.

Use `python scripts/task.py validate` to verify the local ledger.

## Creating a task

Prefer the helper because it generates collision-resistant IDs:

```sh
python scripts/task.py new \
  --title "Improve total station camera framing" \
  --priority high \
  --coordination isolated \
  --write "assets/surveying/total-station/**" \
  --read "shared/**"
```

Generated IDs use `TASK-YYYYMMDD-ABCD`. Legacy/sequential IDs such as
`TASK-0001` remain valid.

Every task must define:

- objective and current problem;
- observable acceptance criteria;
- write scope;
- out-of-scope boundaries;
- validation required;
- dependencies and conflicts where applicable;
- coordination mode: `isolated` or `shared`.

Scope patterns must be exact repository-relative paths or directory patterns ending
in `/**`. This deliberately keeps overlap detection simple and deterministic.

## Claiming a task

Only a task in `todo/` may be claimed. Re-run the preflight immediately before
claiming.

Create a deterministic branch and claim locally:

```sh
git switch -c task/TASK-20260924-A1B2-total-station-framing
python scripts/task.py claim TASK-20260924-A1B2 \
  --agent agent-name \
  --branch task/TASK-20260924-A1B2-total-station-framing
git add todo implementing
git commit -m "TASK-20260924-A1B2: claim task"
```

Then push and open a **draft PR before substantive implementation**:

```text
[TASK-20260924-A1B2] Improve total station camera framing
```

Record the PR number immediately:

```sh
python scripts/task.py set-pr TASK-20260924-A1B2 123
python scripts/task.py validate
```

Do not continue if another active task or PR already owns equivalent work.

## Implementation discipline

The task's `write_scope` is the default mutation boundary. Reading outside that
scope is allowed when needed unless explicitly forbidden. If implementation requires
a new shared path or an unrelated fix, stop that part and create another TODO instead
of broadening the PR informally.

Use:

```sh
python scripts/task.py status TASK-ID blocked --reason "Needs shared camera contract"
python scripts/task.py status TASK-ID implementing
python scripts/task.py status TASK-ID ready
```

`blocked` and `ready` remain in `implementing/`; the directory represents active
ownership, while the status records progress.

### Shared-scope work

Use `coordination: shared` when a task modifies collision-prone infrastructure such
as root policy, shared runtime code, contracts, schemas, central build logic, or other
files commonly touched by multiple features.

The validator rejects overlapping active write scopes. Do not bypass this by widening
or disguising path patterns. Split work, serialize it, or have the integrator reconcile
the dependency.

## Pull-request contract

Every implementation PR must:

- contain exactly one task ID in its title;
- link its task file in the PR body;
- use the task branch;
- stay within the declared write scope except for required task-state metadata;
- avoid opportunistic unrelated cleanup;
- record observed validation and known limitations.

If new work is found, create a new TODO. A future agent may claim it separately.

## Completion and historical record

When implementation and required validation are complete, mark the active task
`ready`. The integrator reviews scope, current base, conflicts, evidence, and merge
readiness.

Immediately before the authorized merge, move the task to historical state in the
same PR:

```sh
python scripts/task.py close TASK-ID completed
python scripts/task.py validate
```

Use `cancelled` or `superseded` with a reason when no implementation should merge.
The task file stays in `completed/` permanently.

## Stale or abandoned claims

Never steal an `implementing/` task merely because it appears inactive.

1. Inspect the linked PR and branch.
2. Establish whether the previous writer has stopped.
3. Preserve useful changes/evidence.
4. Reconcile ownership explicitly.
5. If the work should become available again, the integrator runs:

```sh
python scripts/task.py release TASK-ID --reason "Previous writer stopped; PR closed"
python scripts/task.py validate
```

The release records the previous branch/PR in the task notes before clearing ownership.
If the work should not continue, close it as `cancelled` or `superseded` with a
reason instead.

The ledger is Git-coordinated state, not a remote mutex. Two stale clones can still
race. Collision-resistant IDs, refresh-before-claim, active-PR checks, and write-scope
validation reduce that risk; they do not make it impossible.

## Relationship to asset orchestration

`orchestration/owners.json`, domain queues, worktrees, retry budgets, and
`scripts/check_agent_scope.py` remain authoritative for specialized asset workers.

For an orchestrated asset job, the planner/integrator owns the root lifecycle task and
links it to the reserved queue item. A worker whose scope rules prohibit root changes
must not edit `todo/`, `implementing/`, or `completed/`; the integrator performs
those task-state transitions. The root ledger coordinates repository-level ownership,
while the existing orchestration controls domain-worker execution.

## Local validation

`scripts/task.py validate` checks:

- required metadata and sections;
- task ID/filename consistency;
- folder/status consistency;
- duplicate task IDs;
- missing dependency/conflict references;
- unresolved dependencies on active tasks;
- semantic conflicts between active tasks;
- duplicate active branches or PR numbers;
- invalid path-scope syntax;
- overlapping active write scopes.

It intentionally does **not** query GitHub. Agents must still inspect current open PRs
and refresh the base immediately before claiming work.
