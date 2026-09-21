# Asset review

- Asset: sur-walking-person 0.2.0
- Review type: source/model remediation review, 2026-09-22
- Renderer: Three.js 0.185.1 supplied by the host/demo
- Browser screenshot: not claimed

## Engineering
The distance, arrival, path fraction, and gait phase equations are unchanged from the verified 0.1.0 model. Representative check: L=10 m, v=1.2 m/s gives d(5)=6 m and arrival=8.333333 s. Zero speed remains at the start. Motion stops at the path endpoint.
Gate: passed at source/model level.

## Spatial 3D
Primary visualization is now actual mesh geometry: articulated human, clothing/hardhat, boots, path and markers in a perspective scene. The demo adds lighting, shadows, fog, ground, grid, OrbitControls, camera framing, and focus presentation. It no longer uses SVG as the primary visual.
Gate: implemented; live rendered comparison evidence still pending.

## Animation and pedagogy
Host time drives deterministic limb motion and translation. Limb cycling freezes at arrival. Reduced motion preserves translation while suppressing gait swing. Controls expose path, speed, and gait with minimal text and live distance.
Gate: source-reviewed; live interaction review pending.

## Accessibility / browser
Native controls and role text are present in the demo. Actual browser, keyboard, mobile, WebGL failure, and assistive-technology checks remain not-reviewed.

## Rights
Procedural original geometry only; Three.js is a declared external runtime dependency. No generated images or third-party 3D models are included.

## Decision
Remain in-review until live browser, responsive, accessibility, and captured visual evidence are completed.
