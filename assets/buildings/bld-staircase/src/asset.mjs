import { DEFAULT_PARAMETERS, buildStaircaseModel, normalizeParameters } from './model.mjs';

function requireContext(context) {
  if (!context?.THREE || !context?.scene) {
    throw new TypeError('bld-staircase requires context.THREE and context.scene.');
  }
}

function disposeObject(object) {
  object.traverse((node) => {
    node.geometry?.dispose?.();
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.filter(Boolean).forEach((material) => material.dispose?.());
  });
}

function clearGroup(group) {
  while (group.children.length) {
    const child = group.children.pop();
    child.parent = null;
    disposeObject(child);
  }
}

function cylinderBetween(T, start, end, radius, material) {
  const vector = new T.Vector3().subVectors(end, start);
  const mesh = new T.Mesh(new T.CylinderGeometry(radius, radius, vector.length(), 14), material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), vector.clone().normalize());
  mesh.castShadow = true;
  return mesh;
}

export function createAsset(context = {}) {
  requireContext(context);
  const T = context.THREE;
  const scene = context.scene;
  let parameters = normalizeParameters(DEFAULT_PARAMETERS);
  let timeSeconds = 0;
  let viewport = {};
  let disposed = false;

  const root = new T.Group();
  root.name = 'bld-staircase';
  scene.add(root);

  function rebuild() {
    clearGroup(root);
    const model = buildStaircaseModel(parameters);
    const p = model.parameters;

    const stepColor = 0xbfc5c9;
    for (let index = 0; index < model.goings; index += 1) {
      const topY = (index + 1) * model.riserHeight;
      const geometry = new T.BoxGeometry(p.going, topY, p.width);
      const mesh = new T.Mesh(
        geometry,
        new T.MeshStandardMaterial({ color: stepColor, roughness: 0.82, metalness: 0.02 })
      );
      mesh.position.set(index * p.going + p.going / 2, topY / 2, -p.width / 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      root.add(mesh);

      const edges = new T.LineSegments(
        new T.EdgesGeometry(geometry, 12),
        new T.LineBasicMaterial({ color: 0xf2f7f8, transparent: true, opacity: 0.28 })
      );
      edges.position.copy(mesh.position);
      root.add(edges);
    }

    const landingLength = Math.max(p.going * 2.2, 0.75);
    const landing = new T.Mesh(
      new T.BoxGeometry(landingLength, model.riserHeight, p.width),
      new T.MeshStandardMaterial({ color: 0xaeb6bc, roughness: 0.84 })
    );
    landing.position.set(model.flightRun + landingLength / 2, p.totalRise - model.riserHeight / 2, -p.width / 2);
    landing.castShadow = true;
    landing.receiveShadow = true;
    root.add(landing);

    const railMaterial = new T.MeshStandardMaterial({
      color: 0x394c57,
      metalness: 0.62,
      roughness: 0.34
    });
    const railHeight = 0.9;
    const start = new T.Vector3(0, model.riserHeight + railHeight, 0.02);
    const end = new T.Vector3(model.flightRun, p.totalRise + railHeight, 0.02);
    root.add(cylinderBetween(T, start, end, 0.025, railMaterial.clone()));

    const startFar = start.clone();
    const endFar = end.clone();
    startFar.z = -p.width - 0.02;
    endFar.z = -p.width - 0.02;
    root.add(cylinderBetween(T, startFar, endFar, 0.025, railMaterial.clone()));

    const postEvery = Math.max(1, Math.floor(model.goings / 5));
    for (let index = 0; index <= model.goings; index += postEvery) {
      const x = Math.min(index, model.goings) * p.going;
      const y = Math.min(index + 1, p.risers) * model.riserHeight;
      [0.02, -p.width - 0.02].forEach((z) => {
        root.add(cylinderBetween(
          T,
          new T.Vector3(x, y, z),
          new T.Vector3(x, y + railHeight, z),
          0.018,
          railMaterial.clone()
        ));
      });
    }

    const pitchGeometry = new T.BufferGeometry().setFromPoints([
      new T.Vector3(0, 0.02, -p.width - 0.16),
      new T.Vector3(model.flightRun, p.totalRise + 0.02, -p.width - 0.16)
    ]);
    const pitch = new T.Line(
      pitchGeometry,
      new T.LineDashedMaterial({ color: 0x54d7f2, dashSize: 0.18, gapSize: 0.1 })
    );
    pitch.computeLineDistances();
    root.add(pitch);

    const ground = new T.Mesh(
      new T.BoxGeometry(model.flightRun + landingLength + 1.6, 0.04, p.width + 1.2),
      new T.MeshStandardMaterial({ color: 0x263640, roughness: 0.95 })
    );
    ground.position.set((model.flightRun + landingLength) / 2 - 0.4, -0.03, -p.width / 2);
    ground.receiveShadow = true;
    root.add(ground);
  }

  function ensureLive() {
    if (disposed) throw new Error('Staircase asset has been disposed.');
  }

  function snapshot() {
    ensureLive();
    return {
      id: 'bld-staircase',
      timeSeconds,
      parameters: { ...parameters },
      state: {
        model: buildStaircaseModel(parameters),
        viewport: { ...viewport }
      }
    };
  }

  rebuild();

  return {
    setParameters(next = {}) {
      ensureLive();
      parameters = normalizeParameters({ ...parameters, ...next });
      rebuild();
      return snapshot();
    },
    update(nextTimeSeconds) {
      ensureLive();
      if (!Number.isFinite(nextTimeSeconds) || nextTimeSeconds < 0) {
        throw new RangeError('timeSeconds must be a finite non-negative number.');
      }
      timeSeconds = nextTimeSeconds;
      return snapshot();
    },
    reset() {
      ensureLive();
      parameters = normalizeParameters(DEFAULT_PARAMETERS);
      timeSeconds = 0;
      rebuild();
      return snapshot();
    },
    resize(width, height, pixelRatio = 1) {
      ensureLive();
      if (![width, height, pixelRatio].every((value) => Number.isFinite(value) && value > 0)) {
        throw new RangeError('resize requires positive finite values.');
      }
      viewport = { width, height, pixelRatio };
      return snapshot();
    },
    snapshot,
    dispose() {
      if (disposed) return;
      disposed = true;
      scene.remove(root);
      disposeObject(root);
    }
  };
}
