/** Documentation contract; no runtime library is bundled. */
export type Parameters = Record<string, number | boolean | string>;
export interface AssetContext {
  container: HTMLElement;
  seed: number;
  reducedMotion: boolean;
  three?: unknown; // Consumer injects the declared compatible Three.js namespace.
  scene?: unknown; // Host-owned scene; component adds/removes only its own group.
}
export interface AssetInstance {
  setParameters(values: Parameters): void;
  update(timeSeconds: number): void;
  reset(): void;
  resize(width: number, height: number, pixelRatio: number): void;
  snapshot(): { timeSeconds: number; parameters: Parameters; state: unknown };
  dispose(): void;
}
export type CreateAsset = (context: AssetContext) => AssetInstance;
