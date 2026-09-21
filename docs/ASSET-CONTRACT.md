# Asset contract

The normative metadata shape is [asset.schema.json](../schemas/asset.schema.json).
The initial examples demonstrate valid candidate records. Paths are relative to
the repository root, use forward slashes, and must not escape it or follow a
symlink outside it. IDs are stable kebab-case strings and unique across categories.

## Files and metadata

Each asset needs `asset.json`, a README, and an existing entrypoint. Metadata records
title, category, topics, objectives, kind, renderer, dependencies, network needs,
rights, review state, source provenance, and optional preview/review paths.
Unknown values must be explicit; do not invent dimensions, author names, verified
licenses, GLB exports, performance scores, or preview URLs.

For a published asset, also provide an actual preview, completed review record,
license text path, versioned distributable, and usage instructions. Asset previews
are evidence from the source, not AI-generated substitutes. Component APIs need
documented input ranges, units, return values, errors, and resource disposal.

## Lifecycle

| Status | Meaning | Public distribution |
| --- | --- | --- |
| candidate | Imported or newly drafted; incomplete review | No |
| in-review | Active engineering and delivery review | No |
| approved | Required reviews and rights clearance complete | Eligible |
| deprecated | Previously approved, superseded or withdrawn | Keep notice; apply withdrawal policy |

Approval requires `engineeringReview`, `browserReview`, and `accessibilityReview`
all equal `passed`; rights status `cleared`; nonempty license expression and
existing license text; existing preview and review files. Passing metadata checks
alone does not establish any of these facts. Deprecation records must retain the
prior evidence and state the reason in the README. Unsafe or rights-disputed
downloads may need withdrawal with a visible replacement notice.

## Versioning and dependencies

Start intake records at 0.1.0. Increment versions for published changes. Treat
breaking APIs, unit/sign changes, and changed physical meaning as major changes;
backward-compatible features as minor; compatible corrections as patch. Explain
numerical corrections even if the interface remains unchanged.

Record exact runtime dependencies and whether each is embedded. A source URL is
provenance, not proof it resolves or a license grant. Record third-party notices
when creating distributables. `networkRequired: true` means the HTML currently
depends on remote code/assets; `null` means untested, not offline-compatible.

## Catalog validation

The included Python validator checks the JSON Schema, unique IDs, index/record
agreement, local paths, candidate provenance hashes, and approval-gate metadata.
It supports only the schema keywords used in this repository's current schema;
extend it or use a full JSON Schema validator when extending the schema.
It does not execute HTML or verify engineering, browser, or licensing claims.

## Parallel contributions

New assets are discovered from assets/<category>/<id>/asset.json without editing
the shared legacy catalog. New domains construction-materials and buildings are
additive taxonomy entries. Runtime fields live in a companion component.json,
keeping the existing asset metadata shape compatible. See
[the runtime contract](../contracts/ASSET-RUNTIME.md) and
[agent orchestration](AGENT-ORCHESTRATION.md).
