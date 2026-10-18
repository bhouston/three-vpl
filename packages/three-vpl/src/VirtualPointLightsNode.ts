import type { VirtualPointLightGenerator } from './VirtualPointLightGenerator.js';
import type { Node, UniformNode } from 'three/webgpu';

/** Segment visibility: zero for blocked segments, one for visible segments. */
export type VirtualPointLightVisibility = (start: Node<'vec3'>, end: Node<'vec3'>, index: Node<'int'>) => Node;
import { IrradianceNode } from 'three/webgpu';
import { Fn, If, Loop, dot, float, max, normalWorld, positionWorld, uniform, uniformArray, vec3 } from 'three/tsl';

/**
 * Adds diffuse VPL irradiance to standard node materials via `lights()`.
 * The visibility callback is optional and returns 0 for occluded segments, 1 otherwise.
 * Cost scales with the number of VPLs per shaded fragment. Distance clamping
 * reduces singularities at the expense of energy near the emitters.
 *
 * @augments IrradianceNode
 */
class VirtualPointLightsNode extends IrradianceNode {
  /** CPU sample data used by this lighting node. */
  readonly generator: VirtualPointLightGenerator;
  /** Indirect-light multiplier. Set value to zero to disable evaluation. */
  intensity;
  /** Whether to evaluate visibility. */
  shadows;
  /** Minimum attenuation distance in world units. Defaults to 1. */
  minDistance;
  /** Normal offset for both segment endpoints. Defaults to 0.01. */
  bias;
  /** Active emitter count uploaded to the shader. */
  count;
  static get type() {
    return 'VirtualPointLightsNode';
  }

  /**
   * @param {VirtualPointLightGenerator} generator - The CPU sample data.
   * @param {?Function} [visibility=null] - Segment visibility callback accepting two vec3 nodes and the VPL index.
   */
  constructor(generator: VirtualPointLightGenerator, visibility: VirtualPointLightVisibility | null = null) {
    super(null);

    this.generator = generator;
    /** @type {UniformNode<float>} Indirect-light multiplier; zero disables evaluation. */
    this.intensity = uniform(1);
    /** @type {UniformNode<bool>} Whether to evaluate the visibility callback. */
    this.shadows = uniform(true);
    /** @type {UniformNode<float>} Minimum attenuation distance in world units. */
    this.minDistance = uniform(1);
    /** @type {UniformNode<float>} Surface-normal offset for both segment endpoints. */
    this.bias = uniform(0.01);
    this.count = uniform(generator.count, 'int');
    const positions = uniformArray<'vec3'>(generator.positions, 'vec3');
    const normals = uniformArray<'vec3'>(generator.normals, 'vec3');
    const flux = uniformArray<'vec3'>(generator.flux, 'vec3');

    this.node = Fn(() => {
      const x = positionWorld;
      const n = normalWorld.normalize();
      const sum = vec3(0).toVar();

      If(this.intensity.greaterThan(0), () => {
        Loop(this.count, ({ i }) => {
          const y = positions.element(i);
          const ny = normals.element(i);
          const v = y.sub(x);
          const distanceSquared = max(dot(v, v), 1e-8);
          const w = v.div(distanceSquared.sqrt());
          const cosine = max(dot(n, w), 0).mul(max(dot(ny, w.negate()), 0));

          If(cosine.greaterThan(0), () => {
            const visible = getVisibility(
              visibility,
              this.shadows,
              x.add(n.mul(this.bias)),
              y.add(ny.mul(this.bias)),
              i,
            );
            const attenuation = cosine.div(max(distanceSquared, this.minDistance.mul(this.minDistance)));
            sum.addAssign(flux.element(i).mul(attenuation.mul(visible).div(Math.PI)));
          });
        });
      });

      return sum.mul(this.intensity);
    })();
  }

  /** Updates the active count after regenerating samples. */
  update(): undefined {
    this.count.value = this.generator.count;
  }
}

function getVisibility(
  visibility: VirtualPointLightVisibility | null,
  shadows: UniformNode<'bool', boolean>,
  start: Node<'vec3'>,
  end: Node<'vec3'>,
  index: Node<'int'>,
) {
  const value = float(1).toVar();
  if (visibility !== null) {
    If(shadows, () => {
      value.assign(visibility(start, end, index));
    });
  }

  return value;
}

export { VirtualPointLightsNode };
