# Layered soil + effective stress — surveying-grade 3D rebuild

The existing one-dimensional geostatic/effective-stress model remains authoritative. The renderer is now a real Three.js cutaway soil prism with three spatial strata, a translucent water-table plane, query probe/ring, and separate total/pore/effective stress vectors.

Layer thicknesses determine the 3D vertical proportions. Vector lengths are normalized solely so all stress components remain visible; their exact values come from the model and HUD. The demo leads students from strata and water table through total stress integration to Terzaghi effective stress, with camera staging, OrbitControls, responsive metrics and focus/fullscreen mode.

The scene does not imply lateral stress, settlement, consolidation, capillary suction, or a constitutive soil model.
