# Visualization framing review — 2026-09-22

## Scope and change

All 29 curated Three.js demos now use a shared, model-only bounds calculation
for initial Overview/Fit or explicit camera reset. The six surveying demos keep
their established directional presets. The six structural demos replace fixed
camera resets; six materials and three building demos use bounds-based Camera
controls. The eight hydraulic/geotechnical lessons add Overview and derive
their step-view distance from the current geometry while retaining each step's
view direction. Ordinary parameter changes do not call the camera fitting
function. The explicit Reset model action in building demos now preserves the
chosen camera, just as other parameter changes do.

The fit calculation projects the eight world-space bounds corners against the
camera's horizontal and vertical fields of view. It excludes contextual ground,
grids, and lights from those bounds. It expands the camera clip range and scene
fog when a long model or narrow screen requires a distant camera. The stage
lessons display their step view immediately when reduced motion is requested.
Their phone layout makes the step strip scroll horizontally and puts the
metrics in a horizontal strip beneath the active lesson.

## Observed checks

- `python scripts/validate_catalog.py`: 34 metadata records valid; five
  intake examples unchanged.
- `python scripts/build_site.py`: development viewer built with 31 catalog
  assets and the shared camera module copied into `dist/shared/`.
- `node --check` on each of the 29 demo module scripts: no syntax errors.
- Three.js 0.185.1 geometry-only instantiation: all 29 default assets produced
  nonempty finite world bounds and a finite fit pose at a 0.46 aspect ratio.
  Representative model extents included the 21.24 × 13.33 × 14.16 m building
  envelope and 1.38 × 2.42 × 31.03 m ranging setup.
- Independent projection spot checks with Three.js at aspect ratios 0.46,
  1.8, and 2.0: synthetic boxes from a 0.15 m specimen to a 100 m elongated
  scene projected entirely inside the frustum. Largest normalized horizontal
  or vertical coordinate was 0.769 for the 1.3 padding setting.
- Geometry-only parameter checks attempted individual declared maxima across
  all 29 components. Valid parameter states retained finite bounds. Some
  maxima were rejected by interdependent model constraints; these are not
  treated as successful browser or engineering checks.

## Open release gates

No live browser/WebGL capture, mobile-device visual comparison, keyboard or
assistive-technology inspection was possible here. The available cloud browser
blocked localhost, the agent-browser executable was absent, and a local
Chromium download failed. These changes therefore establish a stronger
framing implementation and structural evidence, **not** a claim that all
scenes have reached final visual, engineering, accessibility, or rights approval.
Review the initial view, full parameter range, every step direction, focus
mode, and phone/landscape layout in a real browser before promotion.
