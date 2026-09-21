# LearnMat

Reusable animation assets and interactive learning materials for civil engineering.

LearnMat is intended to help educators and AI assistants discover, understand,
reuse, and improve engineering visuals. The long-term product is a public asset
catalog hosted on Vercel, with category browsing, previews, downloads, and clear
reuse instructions. Single-HTML learning materials are a primary target.

## What this package contains

This repository contains documentation, five original surveying HTML examples,
and a five-agent contribution scaffold. Each agent has reserved category paths,
an eight-task queue, a bounded repair loop, and an isolated Git worktree. Start with
[the five prompts](instructions/agents/README.md) and
[the orchestration guide](docs/AGENT-ORCHESTRATION.md).
The public asset gallery and Vercel deployment remain future work.

The samples are **intake candidates**, not verified reusable components. They have
not passed browser, accessibility, engineering, or licensing review. Two declare
Three.js CDN dependencies. Standalone HTML does not automatically mean offline.

## Start here

1. Read [the product brief](docs/PRODUCT.md) and [repository architecture](docs/ARCHITECTURE.md).
2. Browse [the sample inventory](docs/SAMPLE-INVENTORY.md) or [catalog.json](catalog/catalog.json).
3. For AI-assisted work, read [AGENTS.md](AGENTS.md) and [the instructions index](instructions/README.md).
4. Add or improve an asset using [CONTRIBUTING.md](CONTRIBUTING.md).
5. Follow [the roadmap](docs/ROADMAP.md) to implement the public catalog.

## Local inspection

Run from the repository root using Python 3:

```sh
python scripts/validate_catalog.py
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/examples/surveying/pace-factor/index.html`.
Replace `pace-factor` with `taping-fieldwork`, `differential-leveling`,
`profile-leveling`, or `compass-traverse` to inspect the other examples.
This development server is for local inspection of supplied code only.

## Documentation

| Document | Purpose |
| --- | --- |
| [Product](docs/PRODUCT.md) | Scope, users, and target capabilities |
| [Architecture](docs/ARCHITECTURE.md) | Repository structure and runtime boundaries |
| [Asset contract](docs/ASSET-CONTRACT.md) | Metadata, files, lifecycle, and versioning |
| [Taxonomy](docs/TAXONOMY.md) | Categories and discovery tags |
| [Reuse](docs/REUSE.md) | Single-HTML integration and offline distinctions |
| [Quality](docs/QUALITY.md) | Engineering, visual, browser, and accessibility review |
| [AI access](docs/AI-ACCESS.md) | Connector capabilities, images, and evidence |
| [Hosting](docs/HOSTING.md) | Planned public delivery and preview isolation |
| [Rights](docs/RIGHTS.md) | Provenance and per-asset reuse permission |
| [Roadmap](docs/ROADMAP.md) | Acceptance criteria for delivery phases |

## Adding these files to an existing repository

Extract to a temporary directory and compare with the current checkout. Preserve
existing README, AGENTS, contribution rules, and application configuration where
they carry current requirements; merge compatible sections instead of overwriting.
No GitHub Actions workflows, framework dependencies, or deployment settings are
included. The public website remains a future implementation step.
