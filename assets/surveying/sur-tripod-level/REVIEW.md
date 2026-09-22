# Asset review — sur-tripod-level 0.2.0

## Engineering
Sight vector remains (cos e sin A, sin e, -cos e cos A). A=0,e=0 -> (0,0,-1); A=90°,e=0 -> (1,0,0). Optical axis y equals instrumentHeight. Tripod geometry is presentation geometry and does not alter this model.
Gate: source/model passed.

## Spatial 3D
Primary output is actual Three.js geometry with three independently positioned legs, feet, head, tribrach, leveling screws, body, telescope, objective/lens, eyepiece, knob, bubble element, station mark and sight ray. Demo supplies perspective/top views, depth, shadows and orbit controls.
Gate: implemented; live rendered reference comparison pending.

## Pedagogy
Controls expose instrument height, leg spread, azimuth and elevation; live vector gives an exact analytical overlay. “Level sight” directly sets sight elevation to zero.
Gate: source-reviewed.

## Browser / accessibility
Responsive/focus UI and semantic role text are present. Live WebGL, mobile, keyboard and assistive-technology checks remain not-reviewed.

## Rights
Original procedural geometry; external dependency limited to declared Three.js runtime.

## Decision
Remain in-review pending rendered/browser/accessibility evidence.

## Camera framing update — 2026-09-22

The demo now uses model-only bounds for explicit Overview/Camera fitting and preserves the chosen view during ordinary parameter changes. Geometry-only checks and remaining live visual review gates are recorded in [the framing review](../../../docs/VISUALIZATION-FRAMING-REVIEW.md). This update does not change engineering or rights status.
