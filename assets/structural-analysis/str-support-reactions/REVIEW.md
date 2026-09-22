# Asset review

- Asset ID and version: str-support-reactions 0.3.2
- Reviewer and review date: annotation remediation self-review, 2026-09-22
- Environment/browser/device/viewport: source review; Vercel/browser observation required before promotion
- Dependencies: Three.js 0.185.1 declared as a non-embedded peer

## Engineering

Constraint topology is unchanged: pin → x/y; horizontal roller → y; fixed → x/y/rz. The 3D hardware is illustrative geometry and reaction vectors remain explicitly non-solved admissible components.

The annotation remediation does not alter the analytical model. Each leader anchor is attached to a specific support feature or reaction vector endpoint.
- Gate: not-reviewed independently

## Annotation layout

- Free-floating Three.js text sprites are removed from this asset.
- Semantic annotation anchors are exposed by the component snapshot.
- The demo projects anchors into screen space every frame.
- Visible annotations are sorted by projected vertical position before layout.
- Successive leader levels use distinct elbow x-positions.
- Label centers preserve the same vertical order as projected anchors, preventing leader-line crossings under normal projection.
- A collision-spacing pass and overflow correction keep labels separated inside the viewport.
- Typography, label width, elbow spacing, and endpoint dots scale with viewport width and camera distance.
- Reaction, moment, and neutral support annotations use distinct but restrained visual accents.

## Progressive disclosure

- Redundant “3D Structural visualization” text is removed.
- Parameters are hidden by default and revealed with a native button carrying `aria-expanded` / `aria-controls`.
- Camera reset, model reset, and Focus view are hidden by default inside the visualization’s Options menu.
- The Options trigger remains inside the 3D viewport in Focus view so the learner can still reset the camera/model or exit focus.
- Clicking outside the menu or pressing Escape closes it.
- The live response/readout remains visible independently from editable parameters.
- Options now exposes independent Information and Labels visibility states.
- Hiding Information removes the surrounding title/readout/caption/footer and expands the viewport without hiding the in-scene Options trigger.
- Hiding Labels suppresses only the leader/callout overlay; the 3D reactions/support remain visible.
- The Focus View action has an explicit accent background after menu-specific button rules, preventing white-on-white text.

## Browser and functionality

- Real Three.js scene is host-rendered; component does not create its own renderer/camera/animation loop.
- Demo pins Three.js 0.185.1 and OrbitControls, enables antialiasing, shadows, camera reset, focus mode, parameter reset, ResizeObserver resizing, and continuous annotation reprojection.
- Live browser execution and WebGL context-loss behavior remain to be independently observed.
- Gate: not-reviewed

## Accessibility

- Parameter controls use native labeled inputs/selects.
- The 3D viewport has an accessible name; numerical meaning is duplicated in text metrics so leader labels and color are not the only carriers.
- Projected callouts are marked aria-hidden because equivalent semantic information is available in the live readout.
- Focus mode has an explicit exit path.
- Screen-reader and keyboard traversal remain to be independently observed.
- Gate: not-reviewed

## Rights

- No third-party visual assets are embedded.
- Three.js is a declared runtime peer.
- Gate: cleared for original repository content; dependency licensing remains external.

## Decision

Candidate only. The annotation remediation materially improves legibility and visual organization but does not self-approve engineering, browser, or accessibility release gates.

## Camera framing update — 2026-09-22

The demo now uses model-only bounds for explicit Overview/Camera fitting and preserves the chosen view during ordinary parameter changes. Geometry-only checks and remaining live visual review gates are recorded in [the framing review](../../../docs/VISUALIZATION-FRAMING-REVIEW.md). This update does not change engineering or rights status.
