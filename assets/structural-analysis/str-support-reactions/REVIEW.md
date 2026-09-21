# Asset review

- Asset ID and version: str-support-reactions 0.2.0
- Reviewer and review date: structures redesign self-review, 2026-09-22
- Environment/browser/device/viewport: source review only; independent runtime capture still required
- Dependencies: Three.js 0.185.1 declared as a non-embedded peer

## Engineering

Constraint topology is unchanged from 0.1.0: pin → x/y; horizontal roller → y; fixed → x/y/rz. The 3D hardware is illustrative geometry and the vectors remain explicitly non-solved reaction components.

The 0.2.0 visual rebuild does not replace or loosen the independent analytical checks in `checks/analytical.md`.
- Gate: not-reviewed independently

## Browser and functionality

- Real Three.js scene is host-rendered; component does not create its own renderer/camera/animation loop.
- Demo pins Three.js 0.185.1 and OrbitControls, enables antialiasing, shadows, camera reset, focus mode, parameter reset, and ResizeObserver resizing.
- Live browser execution and WebGL context-loss behavior remain to be independently observed.
- Gate: not-reviewed

## Accessibility

- Parameter controls use native labeled inputs/selects.
- The 3D viewport has an accessible name; numerical meaning is duplicated in text metrics so color/3D geometry is not the only carrier.
- Focus mode has an explicit exit path.
- Screen-reader and keyboard traversal remain to be independently observed.
- Gate: not-reviewed

## Rights

- No third-party visual assets are embedded.
- Three.js is a declared runtime peer.
- Gate: cleared for original repository content; dependency licensing remains external.

## Decision

Candidate only. The redesign materially raises visual fidelity but does not self-approve engineering, browser, or accessibility release gates.
