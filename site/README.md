# LearnMat Asset Viewer

This directory is the source for the repository-wide development catalog viewer.

## Purpose

The viewer intentionally includes candidate and in-review **Three.js** records so
maintainers can inspect the live 3D entrypoints in one place. Non-3D legacy intake
examples remain in the repository for provenance but are not published in this viewer. It is not the approved-only
public reuse catalog described in docs/HOSTING.md; lifecycle, review, network, and
rights state remain visible throughout the UI.

The application is dependency-free and static. scripts/build_site.py validates
the repository catalog, discovers legacy catalog records plus every
assets/*/*/asset.json, creates dist/catalog.json, copies the viewer shell, and
copies only runtime-facing files needed to execute each eligible 3D catalog entry.
Static preview directories are intentionally excluded from the published output.

## Local build

From the repository root:

    python3 scripts/build_site.py
    python3 -m http.server 8000 --directory dist

Then open http://127.0.0.1:8000/.

The build output is dist/ and should not be committed.

## Vercel

vercel.json configures:

- build command: python3 scripts/build_site.py
- output directory: dist
- no GitHub Actions workflow
- no JavaScript package install
- revalidated catalog/HTML caching rather than immutable caching on mutable paths

Connect the repository to Vercel with the project root set to the repository root.
The Framework Preset can remain Other; the committed vercel.json supplies the
build and output settings. No environment variables are required by the viewer.

## 3D-only presentation

The viewer does not use static asset thumbnails or an image-preview mode. Catalog
cards stay lightweight and open the authoritative live Three.js entrypoint. The
LearnMat header mark is inline SVG markup, not a raster image request.

## Preview isolation

Repository-authored reusable components under assets/ receive the iframe
capabilities needed for same-origin ES-module loading. Legacy intake examples under
examples/ run without allow-same-origin. Neither mode grants top-navigation or
gallery credentials. The viewer stores no authentication secrets.

For a future public release catalog, continue following docs/HOSTING.md: approved
assets only, explicit rights, dedicated preview-origin review for untrusted content,
and versioned distributables.
