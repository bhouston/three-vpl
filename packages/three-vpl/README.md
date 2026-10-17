# three-vpl

Diffuse global illumination for Three.js using virtual point lights (VPLs), extracted from Ben Houston's [Three.js PR #34915](https://github.com/mrdoob/three.js/pull/34915). Supports deterministic multi-bounce CPU sampling, emissive triangles, color bleeding, and cached shadow visibility.

## Install

```sh
npm install three-vpl three@~0.186.0
```

An ESM package targeting Three.js r186 and its WebGPU node-material renderer. Only public `three`, `three/webgpu`, and `three/tsl` entrypoints are used. Types are included; TypeScript users also need `@types/three@~0.186.0`.

## Usage

```js
import { lights } from 'three/tsl';
import { VirtualPointLightGenerator, VirtualPointLightsNode, VirtualPointLightShadowMaps } from 'three-vpl';

// scene contains static meshes and sourceLight, an inverse-square PointLight.
const generator = new VirtualPointLightGenerator(128);
generator.generate(scene, [sourceLight], { count: 128, bounces: 2, seed: 1 });
const shadows = new VirtualPointLightShadowMaps(128, 32, 40);
const indirect = new VirtualPointLightsNode(generator,
  (start, end, index) => shadows.visibility(start, end, index));
indirect.minDistance.value = 1;
// Assign to every receiver's MeshStandardNodeMaterial:
material.lightsNode = lights([sourceLight, indirect]);
await renderer.init();
shadows.update(renderer, scene, generator, indirect.bias.value);
renderer.render(scene, camera);

// After changing static geometry, materials, or source lights:
generator.generate(scene, [sourceLight], { count: 128, bounces: 2, seed: 1 });
indirect.update();
shadows.update(renderer, scene, generator, indirect.bias.value);
// At teardown:
shadows.dispose();
```

The r186 `@types/three` declaration for `lights()` accepts only `Light[]`, although the runtime also accepts lighting nodes. TypeScript callers can pass `indirect as unknown as Light` (with `import type { Light } from 'three'`) until that upstream declaration supports lighting nodes.

`VirtualPointLightHelper` draws emitter markers and exposes `update()` and `dispose()`. Directional lights require nonempty world-space `bounds` in generation options. `candidateMultiplier` traces more CPU candidates and compresses their flux into the same GPU budget. Only the first `generator.count` entries in the position, normal, and flux arrays are active.

## Technique and limits

[Instant Radiosity (Keller, SIGGRAPH 1997)](https://doi.org/10.1145/258734.258769) represents diffuse light paths as secondary emitters. VPLs provide indirect fill and color bleeding. Shadow maps test visibility to reduce light leakage. Static scenes can cache sampling and visibility while the camera moves. More emitters improve sampling at increased fragment cost; extra bounces share the fixed budget. Near-field distance clamping trades energy accuracy for reduced singularities.

Transport is diffuse only. Mesh transforms, albedo/emissive textures and alpha cutouts are sampled; instancing, skinning, normal maps, and mip selection are not evaluated. Image textures require readable browser canvas data, including appropriate cross-origin permissions. Regenerate after scene edits. Each emitter uses six shadow faces; atlas dimensions and uniform storage must fit device limits. Start with modest budgets and test target hardware.

The CPU generator has no BVH dependency. Applications may install accelerated mesh raycasting such as `three-mesh-bvh`; alpha cutouts retain all intersections so transparent hits can be skipped.

## Attribution

Derived from Ben Houston's Three.js contribution under the MIT license. Three.js portions copyright Three.js authors. See LICENSE. [API docs and demo](https://bhouston.github.io/three-vpl/).
