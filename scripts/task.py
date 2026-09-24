#!/usr/bin/env python3
"""Local task-ledger helper for LearnMat agent/human coordination.

This tool intentionally uses only the Python standard library. It validates the
repository's Markdown task ledger and performs local file-state transitions.
It is not a distributed lock and does not replace the mandatory open-PR recheck.
"""

from __future__ import annotations

import argparse
import re
import secrets
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE_DIRS = {
    "todo": ROOT / "todo",
    "implementing": ROOT / "implementing",
    "completed": ROOT / "completed",
}
ALLOWED_STATUS = {
    "todo": {"todo"},
    "implementing": {"implementing", "blocked", "ready"},
    "completed": {"completed", "superseded", "cancelled"},
}
REQUIRED_FIELDS = (
    "id",
    "title",
    "status",
    "priority",
    "created",
    "completed",
    "claimed_by",
    "branch",
    "pr",
    "coordination",
    "block_reason",
    "write_scope",
    "read_scope",
    "forbidden_scope",
    "depends_on",
    "conflicts_with",
)
REQUIRED_SECTIONS = (
    "Objective",
    "Acceptance criteria",
    "Out of scope",
    "Validation required",
)
TASK_ID_RE = re.compile(r"^TASK-(?:\d{4,}|\d{8}-[A-F0-9]{4})$")
SCOPE_RE = re.compile(r"^[^*?\[\]\\]+(?:/\*\*)?$")
ACTIVE_STATUSES = {"implementing", "blocked", "ready"}
CLOSED_STATUSES = {"completed", "superseded", "cancelled"}


class TaskError(RuntimeError):
    pass


def _scalar(value: str):
    value = value.strip()
    if value in {"", "null", "~"}:
        return None
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        return value[1:-1]
    return value


def parse_front_matter(text: str) -> tuple[dict, str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        raise TaskError("missing opening YAML front matter delimiter")
    try:
        end = next(i for i in range(1, len(lines)) if lines[i].strip() == "---")
    except StopIteration as exc:
        raise TaskError("missing closing YAML front matter delimiter") from exc

    data: dict[str, object] = {}
    current_list: str | None = None
    for raw in lines[1:end]:
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        item = re.match(r"^\s{2}-\s*(.+?)\s*$", raw)
        if item and current_list:
            value = _scalar(item.group(1))
            if value is not None:
                data[current_list].append(value)
            continue
        match = re.match(r"^([a-z_]+):(?:\s*(.*))?$", raw)
        if not match:
            raise TaskError(f"unsupported front matter line: {raw!r}")
        key, value = match.groups()
        value = value or ""
        if value.strip() == "":
            data[key] = []
            current_list = key
        else:
            data[key] = _scalar(value)
            current_list = None

    body = "\n".join(lines[end + 1 :]).lstrip("\n")
    return data, body


def update_scalars(text: str, updates: dict[str, object]) -> str:
    result = text
    for key, value in updates.items():
        rendered = "null" if value is None else str(value)
        pattern = re.compile(rf"(?m)^{re.escape(key)}:.*$")
        if not pattern.search(result):
            raise TaskError(f"cannot update missing scalar field {key!r}")
        result = pattern.sub(f"{key}: {rendered}", result, count=1)
    return result


def task_files() -> list[tuple[str, Path]]:
    found: list[tuple[str, Path]] = []
    for folder, directory in STATE_DIRS.items():
        if not directory.exists():
            continue
        for path in sorted(directory.glob("TASK-*.md")):
            found.append((folder, path))
    return found


def load_tasks() -> list[dict]:
    tasks: list[dict] = []
    for folder, path in task_files():
        text = path.read_text(encoding="utf-8")
        try:
            meta, body = parse_front_matter(text)
        except TaskError as exc:
            tasks.append(
                {
                    "_folder": folder,
                    "_path": path,
                    "_text": text,
                    "_parse_error": str(exc),
                }
            )
            continue
        meta["_folder"] = folder
        meta["_path"] = path
        meta["_text"] = text
        meta["_body"] = body
        tasks.append(meta)
    return tasks


def task_by_id(task_id: str, tasks: list[dict] | None = None) -> dict:
    tasks = tasks or load_tasks()
    matches = [task for task in tasks if task.get("id") == task_id]
    if not matches:
        raise TaskError(f"{task_id} was not found in the task ledger")
    if len(matches) > 1:
        raise TaskError(f"{task_id} appears more than once; resolve the duplicate first")
    if "_parse_error" in matches[0]:
        raise TaskError(f"{task_id} cannot be parsed: {matches[0]['_parse_error']}")
    return matches[0]


def scope_descriptor(pattern: str) -> tuple[str, bool]:
    if pattern.endswith("/**"):
        return pattern[:-3].rstrip("/"), True
    return pattern.rstrip("/"), False


def scopes_overlap(a: str, b: str) -> bool:
    a_path, a_tree = scope_descriptor(a)
    b_path, b_tree = scope_descriptor(b)
    if not a_tree and not b_tree:
        return a_path == b_path
    if a_tree and b_tree:
        return (
            a_path == b_path
            or a_path.startswith(b_path + "/")
            or b_path.startswith(a_path + "/")
        )
    if a_tree:
        return b_path == a_path or b_path.startswith(a_path + "/")
    return a_path == b_path or a_path.startswith(b_path + "/")


def validate_scope(value: str) -> str | None:
    if value.startswith("/") or ".." in Path(value).parts:
        return "must be repository-relative and may not contain '..'"
    if not SCOPE_RE.match(value):
        return "must be an exact path or a directory pattern ending in '/**'"
    return None


def _is_positive_pr(value: object) -> bool:
    return bool(value is not None and re.fullmatch(r"[1-9]\d*", str(value)))


def validate() -> list[str]:
    tasks = load_tasks()
    errors: list[str] = []

    for task in tasks:
        path = task["_path"]
        if "_parse_error" in task:
            errors.append(f"{path.relative_to(ROOT)}: {task['_parse_error']}")
            continue

        for field in REQUIRED_FIELDS:
            if field not in task:
                errors.append(f"{path.relative_to(ROOT)}: missing field {field}")

        task_id = task.get("id")
        if not task_id or not TASK_ID_RE.fullmatch(str(task_id)):
            errors.append(f"{path.relative_to(ROOT)}: invalid task id {task_id!r}")
        elif not path.name.startswith(f"{task_id}-"):
            errors.append(
                f"{path.relative_to(ROOT)}: filename must begin with {task_id}-"
            )

        folder = task["_folder"]
        status = task.get("status")
        if status not in ALLOWED_STATUS[folder]:
            errors.append(
                f"{path.relative_to(ROOT)}: status {status!r} is invalid in {folder}/"
            )

        if task.get("priority") not in {"low", "normal", "high", "critical"}:
            errors.append(f"{path.relative_to(ROOT)}: invalid priority")
        if task.get("coordination") not in {"isolated", "shared"}:
            errors.append(
                f"{path.relative_to(ROOT)}: coordination must be isolated or shared"
            )

        for key in (
            "write_scope",
            "read_scope",
            "forbidden_scope",
            "depends_on",
            "conflicts_with",
        ):
            if key in task and not isinstance(task[key], list):
                errors.append(f"{path.relative_to(ROOT)}: {key} must be a list")

        write_scope = task.get("write_scope")
        if isinstance(write_scope, list):
            if not write_scope:
                errors.append(f"{path.relative_to(ROOT)}: write_scope may not be empty")
            for pattern in write_scope:
                problem = validate_scope(str(pattern))
                if problem:
                    errors.append(
                        f"{path.relative_to(ROOT)}: write_scope {pattern!r} {problem}"
                    )

        for key in ("read_scope", "forbidden_scope"):
            value = task.get(key)
            if isinstance(value, list):
                for pattern in value:
                    problem = validate_scope(str(pattern))
                    if problem:
                        errors.append(
                            f"{path.relative_to(ROOT)}: {key} {pattern!r} {problem}"
                        )

        body = task.get("_body", "")
        for section in REQUIRED_SECTIONS:
            if not re.search(rf"(?m)^##\s+{re.escape(section)}\s*$", body):
                errors.append(
                    f"{path.relative_to(ROOT)}: missing required section '## {section}'"
                )

        if folder == "todo":
            if task.get("claimed_by") is not None:
                errors.append(f"{path.relative_to(ROOT)}: TODO must not be claimed")
            if task.get("branch") is not None:
                errors.append(f"{path.relative_to(ROOT)}: TODO must not have a branch")
            if task.get("pr") is not None:
                errors.append(f"{path.relative_to(ROOT)}: TODO must not have a PR")
            if task.get("completed") is not None:
                errors.append(f"{path.relative_to(ROOT)}: TODO must not be completed")
        elif folder == "implementing":
            if not task.get("claimed_by"):
                errors.append(f"{path.relative_to(ROOT)}: active task needs claimed_by")
            if not task.get("branch"):
                errors.append(f"{path.relative_to(ROOT)}: active task needs branch")
            if not _is_positive_pr(task.get("pr")):
                errors.append(
                    f"{path.relative_to(ROOT)}: active task must record its draft/open PR number"
                )
            if task.get("completed") is not None:
                errors.append(f"{path.relative_to(ROOT)}: active task must not be completed")
            if status == "blocked" and not task.get("block_reason"):
                errors.append(f"{path.relative_to(ROOT)}: blocked task needs block_reason")
            if status != "blocked" and task.get("block_reason") is not None:
                errors.append(
                    f"{path.relative_to(ROOT)}: non-blocked task must clear block_reason"
                )
        elif folder == "completed":
            if not task.get("completed"):
                errors.append(f"{path.relative_to(ROOT)}: closed task needs completed date")
            if status == "completed" and not _is_positive_pr(task.get("pr")):
                errors.append(
                    f"{path.relative_to(ROOT)}: completed implementation must retain its PR number"
                )

    parsed = [task for task in tasks if "_parse_error" not in task]
    by_id: dict[str, list[dict]] = {}
    for task in parsed:
        by_id.setdefault(str(task.get("id")), []).append(task)
    for task_id, matches in by_id.items():
        if len(matches) > 1:
            locations = ", ".join(str(t["_path"].relative_to(ROOT)) for t in matches)
            errors.append(f"{task_id}: duplicate task id in {locations}")

    known_ids = set(by_id)
    for task in parsed:
        path = task["_path"].relative_to(ROOT)
        for key in ("depends_on", "conflicts_with"):
            for ref in task.get(key, []) if isinstance(task.get(key), list) else []:
                if ref not in known_ids:
                    errors.append(f"{path}: {key} references missing task {ref}")
                if ref == task.get("id"):
                    errors.append(f"{path}: {key} may not reference itself")

    active = [task for task in parsed if task.get("status") in ACTIVE_STATUSES]
    seen_branches: dict[str, str] = {}
    seen_prs: dict[str, str] = {}
    for task in active:
        task_id = str(task.get("id"))
        branch = task.get("branch")
        pr = task.get("pr")
        if branch:
            if branch in seen_branches:
                errors.append(
                    f"{task_id} and {seen_branches[branch]} share active branch {branch}"
                )
            seen_branches[str(branch)] = task_id
        if _is_positive_pr(pr):
            if str(pr) in seen_prs:
                errors.append(
                    f"{task_id} and {seen_prs[str(pr)]} share active PR #{pr}"
                )
            seen_prs[str(pr)] = task_id

        for conflict in (
            task.get("conflicts_with", [])
            if isinstance(task.get("conflicts_with"), list)
            else []
        ):
            matches = by_id.get(conflict, [])
            if matches and matches[0].get("status") in ACTIVE_STATUSES:
                errors.append(
                    f"{task_id}: conflicts with active task {conflict}"
                )

        for dep in (
            task.get("depends_on", [])
            if isinstance(task.get("depends_on"), list)
            else []
        ):
            matches = by_id.get(dep, [])
            if matches and matches[0].get("status") != "completed":
                errors.append(f"{task_id}: dependency {dep} is not completed")

    for index, left in enumerate(active):
        left_scope = left.get("write_scope", [])
        if not isinstance(left_scope, list):
            continue
        for right in active[index + 1 :]:
            right_scope = right.get("write_scope", [])
            if not isinstance(right_scope, list):
                continue
            overlaps = [
                (a, b)
                for a in left_scope
                for b in right_scope
                if scopes_overlap(str(a), str(b))
            ]
            if overlaps:
                detail = ", ".join(f"{a} <-> {b}" for a, b in overlaps)
                errors.append(
                    f"{left.get('id')} and {right.get('id')}: "
                    f"active write scopes overlap ({detail})"
                )

    return errors


def slugify(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    if not value:
        raise TaskError("title/slug must contain letters or numbers")
    return value[:64].rstrip("-")


def generate_task_id(existing: set[str]) -> str:
    date = datetime.now(timezone.utc).strftime("%Y%m%d")
    for _ in range(50):
        task_id = f"TASK-{date}-{secrets.token_hex(2).upper()}"
        if task_id not in existing:
            return task_id
    raise TaskError("could not generate a unique task id")


def render_list(values: list[str]) -> str:
    if not values:
        return ""
    return "\n".join(f"  - {value}" for value in values)


def new_task(args: argparse.Namespace) -> None:
    tasks = load_tasks()
    existing = {str(task.get("id")) for task in tasks if task.get("id")}
    task_id = args.id or generate_task_id(existing)
    if not TASK_ID_RE.fullmatch(task_id):
        raise TaskError(
            "task id must be TASK-0001 style or TASK-YYYYMMDD-ABCD style"
        )
    if task_id in existing:
        raise TaskError(f"{task_id} already exists")
    slug = slugify(args.slug or args.title)
    path = STATE_DIRS["todo"] / f"{task_id}-{slug}.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        raise TaskError(f"{path.relative_to(ROOT)} already exists")
    write_scope = args.write or []
    if not write_scope:
        raise TaskError("at least one --write scope is required")
    for pattern in write_scope + (args.read or []) + (args.forbidden or []):
        problem = validate_scope(pattern)
        if problem:
            raise TaskError(f"invalid scope {pattern!r}: {problem}")

    today = datetime.now(timezone.utc).date().isoformat()
    content = f"""---
id: {task_id}
title: {args.title}
status: todo
priority: {args.priority}
created: {today}
completed: null
claimed_by: null
branch: null
pr: null
coordination: {args.coordination}
block_reason: null
write_scope:
{render_list(write_scope)}
read_scope:
{render_list(args.read or [])}
forbidden_scope:
{render_list(args.forbidden or [])}
depends_on:
{render_list(args.depends_on or [])}
conflicts_with:
{render_list(args.conflicts_with or [])}
---

## Objective

Describe the outcome, not the implementation mechanism.

## Current problem

Document the current observed problem or requested capability.

## Acceptance criteria

- Replace this with observable completion criteria.

## Out of scope

- State adjacent work that this task must not absorb.

## Validation required

- Record the checks required before this task becomes ready.

## Notes

Add implementation constraints, evidence links, or coordination notes here.
"""
    path.write_text(content, encoding="utf-8")
    print(path.relative_to(ROOT))
    print(f"Suggested branch: task/{task_id}-{slug}")


def claim_task(args: argparse.Namespace) -> None:
    tasks = load_tasks()
    task = task_by_id(args.task_id, tasks)
    if task["_folder"] != "todo" or task.get("status") != "todo":
        raise TaskError(f"{args.task_id} is not available in todo/")
    if not args.branch.startswith(f"task/{args.task_id}-"):
        raise TaskError(
            f"branch must begin with task/{args.task_id}- for deterministic ownership"
        )

    by_id = {str(item.get("id")): item for item in tasks if item.get("id")}
    for dep in task.get("depends_on", []):
        dependency = by_id.get(dep)
        if not dependency or dependency.get("status") != "completed":
            raise TaskError(f"dependency {dep} is not completed")

    for conflict in task.get("conflicts_with", []):
        conflicting = by_id.get(conflict)
        if conflicting and conflicting.get("status") in ACTIVE_STATUSES:
            raise TaskError(f"conflicts with active task {conflict}")

    for other in tasks:
        if other.get("status") not in ACTIVE_STATUSES:
            continue
        if task.get("id") in other.get("conflicts_with", []):
            raise TaskError(
                f"active task {other.get('id')} declares a conflict with {task.get('id')}"
            )
        for mine in task.get("write_scope", []):
            for theirs in other.get("write_scope", []):
                if scopes_overlap(str(mine), str(theirs)):
                    raise TaskError(
                        f"write scope {mine!r} overlaps active "
                        f"{other.get('id')} scope {theirs!r}"
                    )

    source = task["_path"]
    target = STATE_DIRS["implementing"] / source.name
    text = update_scalars(
        task["_text"],
        {
            "status": "implementing",
            "claimed_by": args.agent,
            "branch": args.branch,
            "pr": "pending",
            "block_reason": None,
        },
    )
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8")
    source.unlink()
    print(target.relative_to(ROOT))
    print(
        "Next: commit the claim, open a draft PR, then run set-pr "
        "before implementation."
    )


def set_pr(args: argparse.Namespace) -> None:
    task = task_by_id(args.task_id)
    if task["_folder"] != "implementing":
        raise TaskError("PR numbers are recorded only on implementing tasks")
    text = update_scalars(task["_text"], {"pr": args.pr})
    task["_path"].write_text(text, encoding="utf-8")
    print(task["_path"].relative_to(ROOT))


def set_status(args: argparse.Namespace) -> None:
    task = task_by_id(args.task_id)
    if task["_folder"] != "implementing":
        raise TaskError("status changes apply only to implementing tasks")
    if args.status not in {"implementing", "blocked", "ready"}:
        raise TaskError("active status must be implementing, blocked, or ready")
    if args.status == "blocked" and not args.reason:
        raise TaskError("--reason is required when blocking a task")
    reason = args.reason if args.status == "blocked" else None
    text = update_scalars(
        task["_text"], {"status": args.status, "block_reason": reason}
    )
    task["_path"].write_text(text, encoding="utf-8")
    print(task["_path"].relative_to(ROOT))


def close_task(args: argparse.Namespace) -> None:
    task = task_by_id(args.task_id)
    if task["_folder"] not in {"todo", "implementing"}:
        raise TaskError(f"{args.task_id} is already closed")
    if args.status == "completed":
        if task["_folder"] != "implementing":
            raise TaskError("only an implementing task can be completed")
        if task.get("status") != "ready":
            raise TaskError("mark the implementation ready before completing it")
        if not _is_positive_pr(task.get("pr")):
            raise TaskError("record the implementation PR before completing the task")
    if args.status in {"cancelled", "superseded"} and not args.reason:
        raise TaskError("--reason is required for cancelled or superseded tasks")

    updates = {
        "status": args.status,
        "completed": datetime.now(timezone.utc).date().isoformat(),
        "block_reason": args.reason if args.reason else None,
    }
    text = update_scalars(task["_text"], updates)
    source = task["_path"]
    target = STATE_DIRS["completed"] / source.name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8")
    source.unlink()
    print(target.relative_to(ROOT))


def cmd_validate(_: argparse.Namespace) -> None:
    errors = validate()
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
    print("Task ledger valid.")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Create, claim, transition, and validate LearnMat task records."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    create = sub.add_parser("new", help="create a new TODO task")
    create.add_argument("--title", required=True)
    create.add_argument("--slug")
    create.add_argument("--id")
    create.add_argument(
        "--priority",
        choices=("low", "normal", "high", "critical"),
        default="normal",
    )
    create.add_argument(
        "--coordination",
        choices=("isolated", "shared"),
        default="isolated",
    )
    create.add_argument("--write", action="append", default=[])
    create.add_argument("--read", action="append", default=[])
    create.add_argument("--forbidden", action="append", default=[])
    create.add_argument("--depends-on", action="append", default=[])
    create.add_argument("--conflicts-with", action="append", default=[])
    create.set_defaults(func=new_task)

    claim = sub.add_parser("claim", help="move a TODO into implementing/")
    claim.add_argument("task_id")
    claim.add_argument("--agent", required=True)
    claim.add_argument("--branch", required=True)
    claim.set_defaults(func=claim_task)

    pr = sub.add_parser("set-pr", help="record the draft/open pull request number")
    pr.add_argument("task_id")
    pr.add_argument("pr", type=int)
    pr.set_defaults(func=set_pr)

    status = sub.add_parser("status", help="set implementing/ state")
    status.add_argument("task_id")
    status.add_argument("status", choices=("implementing", "blocked", "ready"))
    status.add_argument("--reason")
    status.set_defaults(func=set_status)

    close = sub.add_parser("close", help="move a task into completed/")
    close.add_argument("task_id")
    close.add_argument("status", choices=("completed", "cancelled", "superseded"))
    close.add_argument("--reason")
    close.set_defaults(func=close_task)

    check = sub.add_parser("validate", help="validate the entire task ledger")
    check.set_defaults(func=cmd_validate)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        args.func(args)
    except TaskError as exc:
        parser.error(str(exc))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
