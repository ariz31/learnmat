# Review — geo-slope-profile 3D replacement

The existing slope geometry and simplified infinite-slope stress model is unchanged. The renderer obtains β, stresses, pore-pressure-reduced effective normal stress, resistance and FS from that model.

The flat slope profile has been replaced by an extruded 3D terrain wedge, surface treatment, planar infinite-slope slice, spatial force directions, pore-pressure markers, perspective camera presets, lighting/shadow-compatible materials, step teaching, responsive HUD and focus mode. The scene repeatedly states that the plane is not a circular-slip/general limit-equilibrium analysis.

No safety verdict is inferred from the model FS. Geometry/vector sizes are normalized only for presentation.

Independent WebGL visual comparison with the surveying references and accessibility remain pending because this connector execution cannot observe a browser render.

## Camera framing update — 2026-09-22

The demo now uses model-only bounds for explicit Overview/Camera fitting and preserves the chosen view during ordinary parameter changes. Geometry-only checks and remaining live visual review gates are recorded in [the framing review](../../../docs/VISUALIZATION-FRAMING-REVIEW.md). This update does not change engineering or rights status.
