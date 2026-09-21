# Reuse in learning materials

## Choose the delivery mode deliberately

| Mode | What the consumer receives | Network behavior |
| --- | --- | --- |
| Hosted embed | iframe pointing to an approved preview | Requires hosting/network |
| Single HTML with CDN | Inline lesson code plus external imports | Requires external dependencies |
| Self-contained HTML | All necessary runtime code/assets in one file | Offline only after verification |
| Download bundle | HTML plus local JS, textures, fonts, or models | May need a local HTTP server |

One HTML file is not evidence of offline operation. None of the supplied examples
has a verified offline claim. The pace-factor and profile-leveling sources declare
remote Three.js imports. Do not replace dependency versions opportunistically.

## AI or developer reuse workflow

1. Select a record from the catalog and check its review state and rights.
2. Read the learning objective, assumptions, units, input limits, and README.
3. Inspect the source and runtime dependency declaration.
4. Select a delivery mode matching the user's environment.
5. Reuse an approved component or derive a new component from a candidate in a
   separate directory; avoid pasting entire presentation shells into another shell.
6. Preserve the 3D-first visual intent. For spatial assets, retain or compose a real
   3D primary scene rather than flattening the asset into SVG/Canvas2D for convenience.
   Keep exact 2D equations, plots, labels, measurements, and tables as overlays or
   companion views. If a reused lesson is intentionally 2D-primary, document why
   3D would not improve the learning objective.
7. Preserve the educational intent. When the lesson teaches a real procedure,
   expose meaningful steps and intermediate reasoning rather than only the final
   animation or answer. For nonprocedural assets, preserve the intended observation,
   comparison, assumptions, and interpretation.
8. Keep default visible text minimal. Prefer concise labels, active-step details,
   tooltips, expandable derivations, and optional tables over persistent long prose.
9. Provide a focus/maximize presentation mode for animated or interactive lessons
   so steps and nonessential panels can be hidden while keeping an obvious exit and
   essential pause/play/reset controls.
10. Scope DOM selectors and CSS. Avoid window-global state conflicts and duplicate
   element IDs. Dispose animation frames, controls, observers, and GPU resources.
11. Keep numerical results and visual geometry consistent after parameter changes.
12. Preserve required attribution and dependency license notices.
13. Check desktop, tablet, and mobile layouts, controls, reset, resize, focused
    presentation mode, reduced-motion behavior, and failure states.

## Consumer contract for future components

Document initialization, units, bounded inputs, outputs/events, pause/reset,
capture state, disposal, and how the component behaves when lesson chrome is hidden
for a focused presentation. Tell consumers whether multiple instances are
supported and whether the drawing is to scale. Use adapters when a lesson needs
a different UI; do not change a model's physics to fit a desired animation.

Hosted embed snippets must use a real deployed URL copied from a successful
deployment. No production URL or functioning embed endpoint is supplied here.
