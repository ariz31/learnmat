// Frame only the educational model. Callers pass the asset's scene roots so
// large contextual floors, grids, and lights do not make the model tiny.
export function getFitPose({ THREE, camera, roots, direction, padding = 1.3 }) {
  const box = new THREE.Box3();
  for (const root of roots) {
    root.updateWorldMatrix(true, true);
    box.expandByObject(root);
  }
  if (box.isEmpty()) return null;

  const target = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const radius = Math.max(size.length() / 2, 0.001);
  const view = direction.clone().normalize();
  if (!Number.isFinite(view.lengthSq()) || view.lengthSq() < 0.5) return null;

  // Project all eight corners into the requested view. This fits elongated
  // models more tightly than a bounding sphere, including narrow viewports.
  const right = new THREE.Vector3().crossVectors(camera.up, view).normalize();
  if (right.lengthSq() < 0.5) right.set(1, 0, 0);
  const up = new THREE.Vector3().crossVectors(view, right).normalize();
  const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  const tanX = tanY * Math.max(camera.aspect, 0.01);
  let distance = 0;
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        const point = new THREE.Vector3(x, y, z).sub(target);
        distance = Math.max(distance,
          point.dot(view) + padding * Math.max(Math.abs(point.dot(right)) / tanX,
            Math.abs(point.dot(up)) / tanY));
      }
    }
  }
  distance = Math.max(distance, radius * 1.3, 0.1);
  return { target, position: target.clone().addScaledVector(view, distance), distance, radius };
}

export function fitSceneToView(options) {
  const pose = getFitPose(options);
  if (!pose) return false;
  const { camera, controls } = options;
  controls.target.copy(pose.target);
  camera.position.copy(pose.position);
  camera.near = Math.max(0.005, Math.min(pose.distance / 200, controls.minDistance * 0.25));
  camera.far = Math.max(camera.far, pose.distance + pose.radius * 6);
  camera.updateProjectionMatrix();
  controls.minDistance = Math.min(controls.minDistance, Math.max(0.02, pose.radius * 0.15));
  controls.maxDistance = Math.max(controls.maxDistance, pose.distance * 5);
  extendSceneFog(options.scene, pose);
  controls.update();
  return true;
}

export function extendSceneFog(scene, pose) {
  if (!scene?.fog?.isFog || !pose) return;
  // A phone's narrower field of view may put a long model beyond a fixed
  // atmospheric cutoff. Keep the educational geometry visible after fitting.
  scene.fog.near = Math.max(scene.fog.near, pose.distance + pose.radius * 1.25);
  scene.fog.far = Math.max(scene.fog.far, pose.distance + pose.radius * 4,
    scene.fog.near + pose.radius);
}
