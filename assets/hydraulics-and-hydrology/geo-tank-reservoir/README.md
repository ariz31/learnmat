# Tank/reservoir storage — surveying-grade 3D rebuild

The constant-area mass-balance model remains the numerical authority. The primary visualization is now a real Three.js storage tank with transparent cylindrical wall, animated water body, inlet/outlet piping, overflow branch, and deterministic flow tracers.

The demo uses a four-step sequence—balance, storage response, physical limit, conservation check—with camera staging, OrbitControls, responsive metrics, play/pause/reset and focus/fullscreen mode. Demo time is intentionally accelerated 120×; the HUD/model still reports real simulation seconds and SI flow/level values.

The tank shell is illustrative rather than a plan-area drawing. Its water fill fraction follows the modeled level/maxLevel, while exact tank area, stored volume and level always come from `src/model.mjs`.
