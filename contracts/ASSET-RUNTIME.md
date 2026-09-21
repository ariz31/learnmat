# Reusable asset runtime v1

Applies to new assets/. Original examples/ remain unchanged complete presentations.
The host owns its renderer, camera, animation clock, and play/pause UI. Components
do not start independent requestAnimationFrame loops or mutate shared libraries.

## Files

Each asset directory contains asset.json (existing catalog schema), component.json
(runtime manifest), README.md, REVIEW.md, src/asset.mjs, src/model.mjs as needed,
demo/index.html, previews/, and checks/. Supporting files stay inside that asset.
Metadata entrypoint points to the working demo, while component.json.module points
to the reusable ES module. Each manifest path is repository-relative.

## API

Export `createAsset(context)` returning the interface in asset-v1.d.ts. Context
provides an instance container, seed, reducedMotion, and optional host-owned Three.js
namespace/scene. If the component needs Three.js, declare its exact peer version and
fail clearly when the host supplies an incompatible runtime. Do not create another
Three.js instance via an unrecorded CDN import. The demo may supply the pinned peer.

- setParameters validates all inputs before changing state; reject non-finite values.
- update(timeSeconds) samples an absolute simulation time, including backward seeks.
  Same seed, inputs, and time produce the same state. Pause means time stops advancing.
- reset restores defaults and time zero without creating duplicate listeners.
- resize handles width, height, and pixel ratio without changing numerical state.
- snapshot returns plain serializable input/result/pose data, excluding DOM/GPU objects.
- dispose is idempotent, removes owned elements/listeners/observers, and releases owned
  GPU resources. Never dispose a host-owned renderer, material, or shared texture.

Document whether setters after disposal throw; use the same policy consistently.
Multiple instances must not share mutable state. Scope CSS to the instance root;
no global IDs, window state, document-wide keyboard capture, or top-level side effects.

## Educational presentation compatibility

Reusable assets must support both a teaching context and a focused presentation
context without changing their engineering model. The host may hide lesson text,
step panels, derivations, tables, and other chrome while keeping the rendered asset
visible. Components must therefore not depend on those panels for simulation state.

Interactive/animated demos should expose a focus/maximize control at the host/demo
layer. Focused presentation shows the animation or interactive scene with minimal
chrome and preserves an obvious exit plus essential pause/play/reset controls.
Exiting focus restores the previous instructional step, parameters, and simulation
time unless the user explicitly reset them.

The default teaching UI should keep visible prose minimal. Detailed derivations and
long explanations belong in active-step regions or progressive disclosure. The
underlying snapshot/model may retain complete numerical state even when the focused
view hides it.

## Geometry, units, and composition

Right-handed geometry uses metres, +Y up, +X east/right, and north along -Z.
Angles are radians at the API boundary; simulation time is seconds. Numerical
models use SI unless their manifest explicitly documents a conversion. Surveying
azimuths are clockwise from north; convert explicitly to the geometry basis.
Label display-only scale exaggeration. The component manifest documents parameter
units/ranges, axes, bounding-box convention, and semantic attachment anchors.

Pass dependencies through host adapters or a versioned declared interface. Never
import relative paths into another asset's src/ directory. Record cross-agent
requests in the task report and let the integrator assign shared contracts. A
generic walking person belongs to surveying; another domain consumes its public
interface rather than duplicating or editing it.

## Template limits

The scaffold template throws until implemented. It is deliberately not a fabricated
finished asset. Static validation checks file presence and declarations, not JS
semantics, physical correctness, browser rendering, or runtime conformance. These
remain observed review gates. Three.js is optional; no new framework is required.
