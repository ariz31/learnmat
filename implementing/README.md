# Implementing tasks

This directory is the active claim ledger. A task here has one owner, one task branch,
and one draft/open implementation PR.

Allowed statuses are `implementing`, `blocked`, and `ready`. All three remain
actively owned and prevent overlapping write scopes from being claimed elsewhere.

Do not duplicate an active task. Do not take over a stale task without explicit
reconciliation of the existing branch and PR.

See `docs/AGENT-TASK-LIFECYCLE.md`.
