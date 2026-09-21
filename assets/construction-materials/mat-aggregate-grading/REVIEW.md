# Asset review — mat-aggregate-grading 0.2.0

## Engineering
- Existing validated analytical model is retained as the authoritative source.
- Retained percentages/masses still close to 100% and the original sample mass; the 3D pile is explicitly non-authoritative visual context.
- Gate: passed for source/model review.

## Pedagogy
- Demo exposes objective, governing relation, visual consequence, check/interpretation, and conclusion with minimal default prose.
- HUD values come from the same snapshot model as the 3D geometry.
- Gate: passed for source/information-architecture review.

## Spatial 3D
- Real Three.js geometry replaces the previous SVG-primary asset.
- Scene includes perspective camera, depth/occlusion, material response, edges/detail, cast/receive shadows, contextual pedestal/ground, orbit inspection, controlled inspection rotation, camera reset, responsive focus mode, and reduced-motion fixed pose.
- No fake 3D/isometric substitute is used.
- Source comparison target: current high-quality surveying examples such as profile-leveling.
- Gate: source-reviewed; rendered/browser comparison not claimed.

## Animation/presentation
- Host-owned absolute time drives a slow deterministic inspection turntable to reveal 3D form.
- Pause/play, camera reset, asset reset, and focus/exit controls are present.
- Reduced-motion holds a fixed pose.
- Browser continuity/state restoration has not been executed.
- Gate: not-reviewed in browser.

## Accessibility
- Native controls, keyboard-focus styles, text HUD, concise text-equivalent lesson, and reduced-motion path are implemented in source.
- Assistive-technology execution not performed.
- Gate: not-reviewed.

## Rights and reuse
- Procedural geometry/materials only; no third-party model or texture.
- Three.js is declared as a pinned non-embedded peer/demo dependency.
- Asset stays candidate because real browser/visual evidence is unavailable in this session.

## Decision
Integrated candidate only. The replacement addresses the requested real-3D quality direction without fabricating screenshot, browser, accessibility, or approval evidence.
