import { DEFAULT_PARAMETERS, buildEnvelopeModel, normalizeParameters } from './model.mjs';

function requireContext(context) {
  if (!context?.THREE || !context?.scene) {
    throw new TypeError('bld-building-envelope requires context.THREE and context.scene.');
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
  root.name = 'bld-building-envelope';
  scene.add(root);

  function material(color, roughness = 0.72, metalness = 0.04, extras = {}) {
    return new T.MeshStandardMaterial({ color, roughness, metalness, ...extras });
  }

  function addBox(width, height, depth, x, y, z, color, extras = {}) {
    if (width <= 0 || height <= 0 || depth <= 0) return null;
    const mesh = new T.Mesh(
      new T.BoxGeometry(width, height, depth),
      material(color, extras.roughness ?? 0.72, extras.metalness ?? 0.04, extras.material ?? {})
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = extras.castShadow !== false;
    mesh.receiveShadow = true;
    root.add(mesh);
    if (extras.edges !== false) {
      const edges = new T.LineSegments(
        new T.EdgesGeometry(mesh.geometry, 12),
        new T.LineBasicMaterial({ color: extras.edgeColor ?? 0xd9e6ee, transparent: true, opacity: extras.edgeOpacity ?? 0.28 })
      );
      edges.position.copy(mesh.position);
      root.add(edges);
    }
    return mesh;
  }

  function rebuild() {
    clearGroup(root);
    const model = buildEnvelopeModel(parameters);
    const p = model.parameters;
    const slabThickness = Math.max(0.08, p.floorHeight * 0.025);
    const wallThickness = Math.max(0.10, Math.min(0.22, p.depth * 0.012));
    const glassDepth = Math.max(0.035, wallThickness * 0.28);

    addBox(p.width * 1.18, 0.08, p.depth * 1.18, 0, -0.04, -p.depth / 2, 0x263746, {
      roughness: 0.92,
      edges: false,
      castShadow: false
    });

    model.floorElevations.forEach((elevation) => {
      addBox(p.width, slabThickness, p.depth, 0, elevation + slabThickness / 2, -p.depth / 2, 0xc7ccd2, {
        roughness: 0.88,
        edgeColor: 0xf0f5f8,
        edgeOpacity: 0.25
      });
    });

    const backY = model.height / 2;
    addBox(p.width, model.height, wallThickness, 0, backY, -p.depth, 0x8c989f, {
      roughness: 0.86,
      edgeColor: 0xe6eef2
    });

    addBox(wallThickness, model.height, p.depth, -p.width / 2, backY, -p.depth / 2, 0x89969e, {
      roughness: 0.86,
      edgeColor: 0xe6eef2
    });

    const retainedDepth = Math.max(wallThickness, p.depth * (1 - p.cutaway));
    addBox(
      wallThickness,
      model.height,
      retainedDepth,
      p.width / 2,
      backY,
      -p.depth + retainedDepth / 2,
      0x89969e,
      { roughness: 0.86, edgeColor: 0xe6eef2 }
    );

    const bayWidth = model.bayWidth;
    for (let floor = 0; floor < p.floors; floor += 1) {
      const floorBase = floor * p.floorHeight;
      const openingBottom = floorBase + p.sillHeight;
      const openingCenterY = openingBottom + p.openingHeight / 2;
      const headHeight = p.floorHeight - p.sillHeight - p.openingHeight;
      const pierWidth = (bayWidth - p.openingWidth) / 2;

      for (let bay = 0; bay < p.bays; bay += 1) {
        const bayLeft = -p.width / 2 + bay * bayWidth;
        const centerX = bayLeft + bayWidth / 2;

        addBox(
          pierWidth,
          p.floorHeight,
          wallThickness,
          bayLeft + pierWidth / 2,
          floorBase + p.floorHeight / 2,
          0,
          0xa4adb3,
          { roughness: 0.82, edgeOpacity: 0.18 }
        );
        addBox(
          pierWidth,
          p.floorHeight,
          wallThickness,
          bayLeft + bayWidth - pierWidth / 2,
          floorBase + p.floorHeight / 2,
          0,
          0xa4adb3,
          { roughness: 0.82, edgeOpacity: 0.18 }
        );

        if (p.sillHeight > 0) {
          addBox(
            p.openingWidth,
            p.sillHeight,
            wallThickness,
            centerX,
            floorBase + p.sillHeight / 2,
            0,
            0x9ba6ad,
            { roughness: 0.84, edgeOpacity: 0.16 }
          );
        }

        if (headHeight > 0) {
          addBox(
            p.openingWidth,
            headHeight,
            wallThickness,
            centerX,
            openingBottom + p.openingHeight + headHeight / 2,
            0,
            0x9ba6ad,
            { roughness: 0.84, edgeOpacity: 0.16 }
          );
        }

        addBox(
          p.openingWidth * 0.96,
          p.openingHeight * 0.96,
          glassDepth,
          centerX,
          openingCenterY,
          wallThickness * 0.58,
          0x4d9ab5,
          {
            roughness: 0.18,
            metalness: 0.08,
            edgeColor: 0xaee5f5,
            edgeOpacity: 0.55,
            material: { transparent: true, opacity: 0.48 }
          }
        );
        const frame = Math.max(0.025, Math.min(0.055, p.openingWidth * 0.025));
        const frameZ = wallThickness * 0.60 + glassDepth * 0.55;
        const frameColor = 0x435963;
        addBox(p.openingWidth, frame, glassDepth * 1.35, centerX, openingBottom + frame / 2, frameZ, frameColor, { roughness: 0.34, metalness: 0.52, edgeOpacity: 0.12 });
        addBox(p.openingWidth, frame, glassDepth * 1.35, centerX, openingBottom + p.openingHeight - frame / 2, frameZ, frameColor, { roughness: 0.34, metalness: 0.52, edgeOpacity: 0.12 });
        addBox(frame, p.openingHeight, glassDepth * 1.35, centerX - p.openingWidth / 2 + frame / 2, openingCenterY, frameZ, frameColor, { roughness: 0.34, metalness: 0.52, edgeOpacity: 0.12 });
        addBox(frame, p.openingHeight, glassDepth * 1.35, centerX + p.openingWidth / 2 - frame / 2, openingCenterY, frameZ, frameColor, { roughness: 0.34, metalness: 0.52, edgeOpacity: 0.12 });
        if (p.openingWidth > 0.9) addBox(frame * 0.82, p.openingHeight - frame * 2, glassDepth * 1.4, centerX, openingCenterY, frameZ + 0.002, frameColor, { roughness: 0.34, metalness: 0.52, edgeOpacity: 0.08 });
      }
    }

    const roofRailHeight = Math.min(0.45, p.floorHeight * 0.14);
    addBox(p.width + 0.15, roofRailHeight, wallThickness, 0, model.height + roofRailHeight / 2, 0, 0x5f6f78, {
      roughness: 0.7
    });
  }

  function ensureLive() {
    if (disposed) throw new Error('Building envelope asset has been disposed.');
  }

  function snapshot() {
    ensureLive();
    return {
      id: 'bld-building-envelope',
      timeSeconds,
      parameters: { ...parameters },
      state: {
        model: buildEnvelopeModel(parameters),
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
