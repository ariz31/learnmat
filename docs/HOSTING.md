# Public catalog and hosting specification

This is a design specification for future Vercel implementation. No Vercel
project, framework, build configuration, domain, or deployment is created here.
At implementation time, check current official Vercel documentation and project
settings before choosing output-directory, header, cache, or deployment options.

## Application requirements

The gallery should offer category filters, search, preview cards, an asset detail
page, download links, source links, and reuse instructions. Serve a generated
public metadata index from the same validated source as the UI. Only approved,
rights-cleared records are included in the public reuse catalog. Keep intake
source and internal review materials out of production output.

## Build and release boundary

1. Validate the catalog and fail on duplicate IDs, missing files, invalid records,
   path escape, or incomplete approval metadata.
2. Select approved assets, copy only declared distributables and required notices,
   and emit version-specific URLs with checksums.
3. Build the gallery and check search, details, preview, download, and error states.
4. Use an authorized Vercel preview build and inspect its actual result.
5. Publish through the authorized release process; record the source commit and URL.

Do not add or trigger GitHub Actions. Do not label a local metadata check a
successful Vercel build. Do not attach immutable caching to mutable catalog URLs.
Use immutable versioned asset URLs and revalidate mutable discovery metadata.

## Interactive preview isolation

Treat imported HTML/JavaScript as executable third-party content. Serve previews
from a separate origin without gallery credentials and place them inside an
iframe with the minimum sandbox capabilities needed by that asset. Start with
`allow-scripts`; downloads, fullscreen, and other capabilities require explicit
feature review. Avoid pairing `allow-scripts` with `allow-same-origin` for untrusted
same-origin content. If opaque-origin restrictions break a feature, use dedicated
isolated hosting and review its permissions rather than removing the sandbox.

Use a per-preview dependency policy, restrictive security headers, bounded message
payloads, and origin/source checks for any postMessage integration. Do not broadly
disable the gallery's content policy because an imported example uses inline code.
Keep gallery authentication and user secrets out of preview contexts.

## File delivery and performance

Serve correct MIME types and explicit download behavior. Test cross-origin asset
loading when embeds use a separate origin. Use static thumbnails on catalog cards;
load the interactive scene only on demand. Provide meaningful network/WebGL error
states. Large models may need separately hosted immutable files rather than
embedding binary data in every lesson. Decide limits from measured assets and the
actual hosting plan, not guessed platform quotas.
