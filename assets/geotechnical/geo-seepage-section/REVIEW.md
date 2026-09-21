# Review — geo-seepage-section 3D replacement

The existing signed Darcy-flow model is unchanged. The renderer consumes its head drop, gradient, flux and discharge direction. Swapping heads reverses the tracer direction; equal heads suppress flow visualization.

The primary scene is now genuine Three.js geometry with soil volume, water reservoirs, boundary walls, head line, spatial tracks, direction cue, depth/occlusion, lighting/shadow-compatible materials, camera staging and focus mode. The documentation and in-demo scope statement explicitly prevent the tracks from being interpreted as a computed 2-D flow net.

Head elevations and tracer speed are normalized/exaggerated for visibility only.

No WebGL browser was available in this connector execution, so rendered surveying-reference visual parity and accessibility remain pending.
