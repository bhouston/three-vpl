import type { Box3, DirectionalLight, InstancedMesh, PointLight, Scene, Vector3 } from 'three';
import type { IrradianceNode, Node, RenderTarget, UniformNode, WebGPURenderer } from 'three/webgpu';

/** Controls reproducible CPU light-path sampling. */
export type VirtualPointLightOptions = {
  /** Maximum active emitters, bounded by generator capacity. Defaults to 256. */
  count?: number;
  /** Deterministic random seed. Defaults to 1. */
  seed?: number;
  /** World sampling bounds; required for directional lights. */
  bounds?: Box3 | null;
  /** Maximum diffuse reflections, 1–16. Defaults to 1. */
  bounces?: number;
  /** Trace additional candidates and compress to count emitters, 1–16. Defaults to 1. */
  candidateMultiplier?: number;
  /** Allocate rays by source power and luminance. Defaults to true. */
  importanceSampling?: boolean;
  /** Include visible emissive triangles. Defaults to true. */
  emissive?: boolean;
  /** Stratify initial directions and emitter areas. Defaults to true. */
  stratified?: boolean;
  /** Spatially order candidates before importance resampling. Defaults to true. */
  spatialResampling?: boolean;
};

/** Deterministic diffuse transport for static meshes and point, directional, and emissive sources.
 * Instancing, skinning, normal maps, and texture mip selection are not evaluated.
 */
export class VirtualPointLightGenerator {
  /** Allocate fixed emitter storage. Capacity must be a positive integer. */
  constructor(capacity?: number);
  /** Maximum GPU emitter count. */
  readonly capacity: number;
  /** Number of active entries in positions, normals, and flux. */
  count: number;
  /** Number of CPU rays traced by the last generation. */
  rayCount: number;
  /** Number of sampled emitters before compression. */
  candidateCount: number;
  /** World positions; only the first count entries are active. */
  readonly positions: Vector3[];
  /** Unit world normals pointing into the reflected hemisphere. */
  readonly normals: Vector3[];
  /** Reflected RGB flux in linear color space. */
  readonly flux: Vector3[];
  /** Regenerate after changing geometry, materials, or source lights.
   * Point lights must use inverse-square decay. CPU texture sampling of image sources needs a browser canvas.
   */
  generate(scene: Scene, lights: Array<PointLight | DirectionalLight>, options?: VirtualPointLightOptions): this;
}

/** Visibility callback receiving receiver position, emitter position, and integer emitter index.
 * Return a TSL node evaluating to zero for blocked segments and one for visible segments.
 */
export type VirtualPointLightVisibility = (start: Node, end: Node, index: Node) => Node;

/** Diffuse VPL irradiance for a node material's lightsNode, composed with lights([...]).
 * Fragment cost grows with the active emitter count. Distance clamping reduces near-field singularities.
 */
export class VirtualPointLightsNode extends IrradianceNode {
  constructor(generator: VirtualPointLightGenerator, visibility?: VirtualPointLightVisibility | null);
  readonly generator: VirtualPointLightGenerator;
  /** Indirect-light multiplier. Set value to zero to disable evaluation. */
  intensity: UniformNode<'float', number>;
  /** Whether to evaluate visibility. */
  shadows: UniformNode<'bool', boolean>;
  /** Minimum attenuation distance in world units. Defaults to 1. */
  minDistance: UniformNode<'float', number>;
  /** Normal offset for both segment endpoints. Defaults to 0.01. */
  bias: UniformNode<'float', number>;
  /** Active emitter count uploaded to the shader. */
  count: UniformNode<'int', number>;
  /** Update after regenerating samples. */
  update(): undefined;
}

/** Cached six-face radial-distance shadow atlas for static scene visibility. */
export class VirtualPointLightShadowMaps {
  /** Allocate an atlas; resolution is pixels per face and far is the maximum world distance. */
  constructor(capacity: number, resolution?: number, far?: number);
  readonly capacity: number;
  /** Pixels per cube face; pass a new resolution to update to resize safely. */
  resolution: UniformNode<'int', number>;
  /** Maximum capture distance. */
  far: number;
  /** Packed radial-distance texture atlas. */
  target: RenderTarget;
  /** Generate the visibility expression for an emitter. */
  visibility(start: Node, end: Node, index: Node, receiverNormal?: Node): Node;
  /** Capture all active emitters; call after regeneration or changes to static occluders or bias. */
  update(renderer: WebGPURenderer, scene: Scene, generator: VirtualPointLightGenerator, bias: number, resolution?: number): void;
  /** Release GPU resources. */
  dispose(): void;
}

/** Instanced colored sphere markers for inspecting sampled emitter positions and reflected flux. */
export class VirtualPointLightHelper extends InstancedMesh {
  /** Size is the marker radius in world units. Defaults to 0.12. */
  constructor(generator: VirtualPointLightGenerator, size?: number);
  readonly generator: VirtualPointLightGenerator;
  /** Refresh positions and colors after regeneration. */
  update(): void;
  /** Release marker geometry and material. */
  dispose(): void;
}
