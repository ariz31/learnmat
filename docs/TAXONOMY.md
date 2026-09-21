# Asset taxonomy

| Category ID | Scope |
| --- | --- |
| surveying | Measurements, field procedures, instruments, and spatial data |
| engineering-mechanics | Forces, equilibrium, kinematics, and dynamics |
| structural-analysis | Structural response, stability, and analysis methods |
| reinforced-concrete | Concrete member behavior and detailing |
| steel-and-timber | Steel and timber members, systems, and connections |
| geotechnical | Soil, foundations, retaining structures, and slopes |
| hydraulics-and-hydrology | Fluid behavior, pipe/channel flow, and water systems |
| transportation | Traffic, roadway geometry, pavements, and transport systems |
| construction | Construction sequencing, equipment, and project methods |
| engineering-geology | Earth materials, geological processes, and site context |
| mathematics | Supporting mathematical models and visual explanations |
| building-systems | Plumbing, life safety, and building services |

Give an asset one primary category and multiple specific kebab-case topic tags.
Use descriptive tags such as `pace-factor`, `height-of-instrument`, and
`bowditch-adjustment`. Do not assign a category solely from a rendering library.
Preserve IDs when reorganizing; update paths and references together.

Kinds: `presentation`, `simulation`, `component`, `model`, `diagram`.
Renderers: `threejs`, `canvas2d`, `svg`, `html`, `mixed`, `unknown`.
The renderer records technology, not fidelity or engineering validity.
