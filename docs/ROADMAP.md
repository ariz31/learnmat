# Implementation roadmap

| Phase | Deliverable | Acceptance criteria |
| --- | --- | --- |
| 0 — Documentation | This starter, records, templates, and supplied sources | Paths and schema validate; intake provenance is traceable |
| 1 — Asset review | Review the five surveying examples | Independent engineering checks, browser/accessibility evidence, explicit rights |
| 2 — Reusable extraction | Shared models/components with small demos | Documented lifecycle, isolated styles/state, multiple-instance checks where supported |
| 3 — Public catalog | Category/search/detail/download interface | Approved assets only; real previews; working error and empty states; mobile access |
| 4 — Vercel publication | Reviewed public deployment | Verified build, isolated preview execution, versioned downloads, tested reuse flow |
| 5 — Continuous improvement | Documented contributor and AI workflows | Reproducible issue-to-review process; previews and metadata stay aligned |

Phase 0 delivers structure, not proof that Phase 1 has passed. Before integrating
into an existing LearnMat checkout, compare its current architecture and rules with
this proposal. Retain established conventions unless a scoped migration is needed.

Next useful work: verify source rights and review one sample end to end, then
extract its reusable model and renderer as the reference implementation. Build the
gallery against the resulting contract before scaling to additional disciplines.
