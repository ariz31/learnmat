import { DEFAULT_PARAMETERS, buildFloorAssemblyModel, normalizeParameters } from './model.mjs';

function requireContext(context) {
  if (!context?.THREE || !context?.scene) {
    throw new TypeError('bld-floor-assembly requires context.THREE and context.scene.');
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

export function createAsset(context = {}) {
  requireContext(context);
  const T = context.THREE;
  const scene = context.scene;
  let parameters = normalizeParameters(DEFAULT_PARAMETERS);
  let timeSeconds = 0;
  let viewport = {};
  let disposed = false;

  const root = new T.Group();
  root.name = 'bld-floor-assembly';
  scene.add(root);

  const colors = {
    ceilingBoard: 0xe7e2d4,
    slab: 0x9ca5ac,
    screed: 0xcbbda5,
    finish: 0x6a8c9d
  };

  function addSolid(layer, model) {
    if (layer.thickness <= 0) return;
    const geometry = new T.BoxGeometry(model.width, layer.thickness, model.depth);
    const material = new T.MeshStandardMaterial({
      color: colors[layer.key] ?? 0xaeb8bd,
      roughness: layer.key === 'finish' ? 0.42 : 0.82,
      metalness: 0.02
    });
    const mesh = new T.Mesh(geometry, material);
    mesh.position.y = layer.explodedBottomY + layer.thickness / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    root.add(mesh);

    const edges = new T.LineSegments(
      new T.EdgesGeometry(geometry, 12),
      new T.LineBasicMaterial({ color: 0xf0f6f8, transparent: true, opacity: 0.35 })
    );
    edges.position.copy(mesh.position);
    root.add(edges);
  }

  function addServiceVoid(layer, model) {
    if (layer.thickness <= 0) return;
    const geometry = new T.BoxGeometry(model.width, layer.thickness, model.depth);
    const mesh = new T.Mesh(
      geometry,
      new T.MeshBasicMaterial({
        color: 0x46b7d8,
        transparent: true,
        opacity: 0.045,
        depthWrite: false
      })
    );
    mesh.position.y = layer.explodedBottomY + layer.thickness / 2;
    root.add(mesh);

    const edges = new T.LineSegments(
      new T.EdgesGeometry(geometry),
      new T.LineBasicMaterial({ color: 0x5fd7f5, transparent: true, opacity: 0.6 })
    );
    edges.position.copy(mesh.position);
    root.add(edges);

    const pipeMaterial = new T.MeshStandardMaterial({
      color: 0x4d83a2,
      metalness: 0.48,
      roughness: 0.34
    });
    [-0.22, 0.22].forEach((ratio, index) => {
      const pipe = new T.Mesh(
        new T.CylinderGeometry(0.025 + index * 0.005, 0.025 + index * 0.005, model.width * 0.76, 18),
        pipeMaterial.clone()
      );
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(0, layer.explodedBottomY + layer.thickness * (0.42 + index * 0.18), model.depth * ratio);
      pipe.castShadow = true;
      root.add(pipe);
    });
  }

  function rebuild() {
    clearGroup(root);
    const model = buildFloorAssemblyModel(parameters);

    const base = new T.Mesh(
      new T.BoxGeometry(model.width * 1.12, 0.035, model.depth * 1.12),
      new T.MeshStandardMaterial({ color: 0x1b2b35, roughness: 0.95 })
    );
    base.position.y = -0.02;
    base.receiveShadow = true;
    root.add(base);

    model.layers.forEach((layer) => {
      if (layer.kind === 'void') addServiceVoid(layer, model);
      else addSolid(layer, model);
    });
  }

  function ensureLive() {
    if (disposed) throw new Error('Floor assembly asset has been disposed.');
  }

  function snapshot() {
    ensureLive();
    return {
      id: 'bld-floor-assembly',
      timeSeconds,
      parameters: { ...parameters },
      state: {
        model: buildFloorAssemblyModel(parameters),
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
