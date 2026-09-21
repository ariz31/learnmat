# AI access and continuous improvement

## What repository guidance can and cannot provide

The repository can expose discoverable source, metadata, instructions, and preview
files. It cannot grant an AI assistant GitHub permissions, install a connector,
give access to private repositories, or guarantee that a text-only connector can
display images. Full useful access means using the capabilities actually enabled
by the account and runtime, within the user's authorization.

## Capability-aware behavior

| Available capability | Supported workflow |
| --- | --- |
| Repository read/search | Find catalog records, source, assumptions, and instructions |
| Image/file retrieval | Retrieve an existing preview and associate it with its source version |
| Browser rendering | Capture a real asset state when previews are missing or stale |
| Branch/file write | Prepare a scoped change and update metadata/evidence |
| Pull-request write | Submit an improvement with evidence, when authorized |
| No repository access | Work from provided files; request only the missing source needed |

Before a write, verify repository identity and current branch/head. Do not infer
write or merge permission from read access. Never place tokens in instructions.
Use a development branch and the repository's review workflow for improvements.

## Image requests

Return an actual checked-in preview or an actual rendered screenshot when the
runtime supports it. Include the asset ID and version, distinguish a screenshot
from source HTML, and note stale previews. If neither retrieval nor rendering is
available, provide the real source path or available link and explain the gap.
Do not claim a JSON preview field makes the image automatically viewable.

## Instruction discovery

Read AGENTS.md and instructions/README.md, then the task-specific workflow.
These are repository documents, not an installed ChatGPT skill or a promise of
automatic connector indexing. Keep important usage instructions in plain text
alongside each asset so text-based repository search can find them.

## Improvement loop

Record a reproducible issue → inspect source and model → make a scoped correction
→ validate numerically and visually → update preview and metadata → submit for
review → publish only after the release gates pass. Log unavailable capabilities
and incomplete checks plainly rather than simulating their outcomes.
