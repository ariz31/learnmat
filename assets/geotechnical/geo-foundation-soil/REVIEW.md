# Review — geo-foundation-soil 3D replacement

The existing q=P/A ± 6M/(LB²), eccentricity and middle-third model remains authoritative. The renderer interpolates those exact edge pressures to produce compression arrows and suppresses negative-pressure arrows rather than implying tensile soil contact.

The primary visualization is now true Three.js geometry: soil mass, footing, column, eccentric load, moment cue, compression field, invalid-contact zone, perspective camera, lighting/shadow-compatible materials, educational steps and focus mode.

The scene deliberately does not solve no-tension redistribution or any capacity/settlement check.

Rendered surveying-reference comparison and accessibility remain pending because no browser/WebGL session was available in this connector execution.

## Camera framing update — 2026-09-22

The demo now uses model-only bounds for explicit Overview/Camera fitting and preserves the chosen view during ordinary parameter changes. Geometry-only checks and remaining live visual review gates are recorded in [the framing review](../../../docs/VISUALIZATION-FRAMING-REVIEW.md). This update does not change engineering or rights status.
