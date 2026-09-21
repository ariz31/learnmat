# Review — geo-open-channel 3D replacement

## Engineering
The existing rectangular-section model is retained unchanged. Renderer geometry uses the model's width/depth and displays model-computed area, velocity, hydraulic radius, Froude number, regime and Manning capacity. No normal-depth solver has been introduced.

## 3D / teaching quality
The primary scene is now actual Three.js spatial geometry rather than SVG: U-channel concrete, translucent water volume, measuring staff, animated internal tracers, direction arrow, contextual slab/ground, perspective camera, lights, shadows, fog, responsive HUD, step navigation, camera staging and focus/fullscreen mode. Exact equations stay in an analytical overlay.

The amber bed-slope cue and longitudinal length are explicitly presentation-scaled so students do not infer dimensions from the scene.

## Runtime
The component requires host Three.js r185 and host scene/time. It creates no renderer, camera or animation loop. GPU resources owned by the component are disposed on teardown.

## Pending rendered gate
No WebGL browser was available through this repository connector execution. Surveying-reference pixel-level comparison and assistive-technology review therefore remain pending rather than being fabricated.
