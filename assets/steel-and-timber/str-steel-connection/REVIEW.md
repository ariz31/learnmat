# Asset review

- Asset ID and version: str-steel-connection 0.2.0
- Reviewer and review date: structures redesign self-review, 2026-09-22
- Environment/browser/device/viewport: source review only; independent runtime capture remains required
- Dependencies: Three.js 0.185.1 declared as a non-embedded peer

## Engineering

The geometric fit equations remain unchanged. Default four-bolt group length is 225 mm; a 340 mm plate gives 57.5 mm vertical edge distance, and a 140 mm width gives 70 mm horizontal edge distance. Exploded translation is not deformation.
- Gate: not-reviewed independently

## Browser and functionality

- Component adds only owned Three.js objects to the host scene; renderer/camera/clock stay host-owned.
- Demo provides OrbitControls, camera reset, model reset, focus mode, antialiased rendering, shadows, and ResizeObserver behavior.
- Live WebGL execution and context-loss behavior remain to be observed.
- Gate: not-reviewed

## Accessibility

- Native controls are labeled and live numerical meaning is duplicated outside the canvas.
- Focus mode has an explicit exit control.
- Screen-reader/keyboard execution remains to be observed.
- Gate: not-reviewed

## Rights

- No third-party visual assets are embedded; Three.js is a declared external runtime peer.
- Gate: cleared for repository-authored content.

## Decision

Candidate only. Premium visual fidelity does not substitute for independent engineering, browser, or accessibility approval.

## Camera framing update — 2026-09-22

The demo now uses model-only bounds for explicit Overview/Camera fitting and preserves the chosen view during ordinary parameter changes. Geometry-only checks and remaining live visual review gates are recorded in [the framing review](../../../docs/VISUALIZATION-FRAMING-REVIEW.md). This update does not change engineering or rights status.
