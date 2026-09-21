# Fixed-head seepage — surveying-grade 3D rebuild

The homogeneous 1-D Darcy model remains the engineering authority. The primary renderer is now a real Three.js section: a spatial soil prism between upstream/downstream fixed-head reservoirs, boundary walls, a display-normalized total-head line, directional arrow and animated representative flow tracks.

The straight tracks are intentionally **not** presented as a 2-D flow net. Their direction follows the sign of the model discharge; their speed is display-scaled. Exact head drop, gradient, Darcy flux, area and discharge remain analytical HUD values.

The demo provides a four-step boundary→gradient→Darcy→limit sequence, camera presets, OrbitControls, responsive overlays, pause/reset and focus/fullscreen presentation.
