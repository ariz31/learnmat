# Shallow footing contact pressure — surveying-grade 3D rebuild

The rigid-footing analytical model remains unchanged. The new Three.js scene places a recognizable concrete footing/column on a volumetric soil block, locates the eccentric vertical load, shows a moment cue, and renders a row of compression reaction arrows interpolated from the exact edge pressures.

Reaction lengths are normalized for readability. If the linear full-contact solution produces qmin < 0, negative soil tension is **not** rendered; a red spatial zone flags that the full-contact assumption has failed. No no-tension redistribution, bearing-capacity, settlement or reinforcement design is fabricated.

The demo teaches load/moment, resultant eccentricity, pressure distribution and assumption validity with camera presets, analytical HUD, OrbitControls and focus/fullscreen mode.
