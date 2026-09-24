import { installSimulationLayout } from './simulation-runtime.mjs';

installSimulationLayout();

// Frame only the educational model. Callers pass the asset's scene roots so
// contextual floors, grids, lights, and other host-owned objects do not make
// the model tiny. Individual asset helpers may opt out with
// object.userData.fitExclude = true.
function expandFitBounds(THREE, box, object) {
  if (!object || object.visible === false || object.userData?.fitExclude === true) return;

  object.updateWorldMatrix(false, false);

  if (object.geometry) {
    const geometry = object.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox?.();
    if (geometry.boundingBox && !geometry.boundingBox.isEmpty()) {
      const local = geometry.boundingBox.clone().applyMatrix4(object.matrixWorld);
      if (
        Number.isFinite(local.min.x) && Number.isFinite(local.min.y) && Number.isFinite(local.min.z) &&
        Number.isFinite(local.max.x) && Number.isFinite(local.max.y) && Number.isFinite(local.max.z)
      ) {
        box.union(local);
      }
    }
  }

  for (const child of object.children || []) expandFitBounds(THREE, box, child);
}

export function getFitPose({ THREE, camera, roots, direction, padding = 1.3 }) {
  const box = new THREE.Box3();
  for (const root of roots || []) {
    root.updateWorldMatrix(true, true);
    expandFitBounds(THREE, box, root);
  }
  if (box.isEmpty()) return null;

  const target = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.length() / 2, 0.001);

  const view = direction?.clone?.();
  if (!view || !Number.isFinite(view.lengthSq()) || view.lengthSq() < 1e-8) return null;
  view.normalize();

  // Build a stable view basis. Use the camera up vector when possible and
  // fall back to a world axis when the requested direction is nearly vertical.
  const right = new THREE.Vector3().crossVectors(camera.up, view);
  if (!Number.isFinite(right.lengthSq()) || right.lengthSq() < 1e-8) {
    right.crossVectors(new THREE.Vector3(0, 0, 1), view);
  }
  if (right.lengthSq() < 1e-8) right.set(1, 0, 0);
  right.normalize();
  const up = new THREE.Vector3().crossVectors(view, right).normalize();

  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const safeAspect = Math.max(Number.isFinite(camera.aspect) ? camera.aspect : 1, 0.08);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * safeAspect);
  const tanY = Math.max(Math.tan(vFov / 2), 1e-4);
  const tanX = Math.max(Math.tan(hFov / 2), 1e-4);
  const requestedPadding = Math.max(Number.isFinite(padding) ? padding : 1.3, 1.02);

  // Narrow embedded viewers need additional breathing room because educational
  // overlays occupy part of the frame. This also prevents initial camera poses
  // from feeling unintentionally "zoomed in" on phones/tablets.
  const responsivePadding = requestedPadding * (safeAspect < 0.9 ? 1.12 : 1);

  let projectedDistance = 0;
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        const point = new THREE.Vector3(x, y, z).sub(target);
        projectedDistance = Math.max(
          projectedDistance,
          point.dot(view) + responsivePadding * Math.max(
            Math.abs(point.dot(right)) / tanX,
            Math.abs(point.dot(up)) / tanY
          )
        );
      }
    }
  }

  // The projected-box result is tight but can become too aggressive for small
  // or unusually oriented models. A bounding-sphere FOV limit is a deliberate
  // conservative floor: it guarantees the complete educational model remains
  // in front of the camera even when the viewport is narrow.
  const halfFov = Math.max(0.12, Math.min(vFov, hFov) / 2);
  const sphereDistance = (radius / Math.sin(halfFov)) * responsivePadding;
  const distance = Math.max(projectedDistance, sphereDistance, radius * 1.6, 0.1);

  const position = target.clone().addScaledVector(view, distance);
  if (![position.x, position.y, position.z, target.x, target.y, target.z, distance, radius]
    .every(Number.isFinite)) return null;

  return { target, position, distance, radius, box, padding: responsivePadding };
}

export function fitSceneToView(options) {
  const pose = getFitPose(options);
  if (!pose) return false;

  const { camera, controls } = options;
  controls.target.copy(pose.target);
  camera.position.copy(pose.position);

  // Keep clipping planes independent of OrbitControls defaults. Some controls
  // begin with minDistance=0 or maxDistance=Infinity, which should never feed
  // directly into camera clip calculations.
  camera.near = Math.max(0.005, Math.min(pose.distance / 250, pose.radius / 120));
  camera.far = Math.max(
    Number.isFinite(camera.far) ? camera.far : 0,
    pose.distance + pose.radius * 10,
    camera.near * 1000
  );
  camera.updateProjectionMatrix();

  const safeMin = Math.max(0.02, pose.radius * 0.06);
  const safeMax = Math.max(pose.distance * 6, pose.radius * 12, safeMin * 8);
  controls.minDistance = Number.isFinite(controls.minDistance) && controls.minDistance > 0
    ? Math.min(controls.minDistance, safeMin)
    : safeMin;
  controls.maxDistance = Number.isFinite(controls.maxDistance)
    ? Math.max(controls.maxDistance, safeMax)
    : safeMax;

  extendSceneFog(options.scene, pose);
  controls.update();
  return true;
}

export function extendSceneFog(scene, pose) {
  if (!scene?.fog?.isFog || !pose) return;

  // Keep the educational geometry clear after a distant fit. The far value is
  // always kept beyond the full fitted model and may never collapse behind
  // the near value.
  const desiredNear = Math.max(0, pose.distance - pose.radius * 1.6);
  const desiredFar = pose.distance + pose.radius * 5;
  scene.fog.near = Math.max(0, Math.min(scene.fog.near, desiredNear));
  scene.fog.far = Math.max(scene.fog.far, desiredFar, scene.fog.near + pose.radius * 2);
}
