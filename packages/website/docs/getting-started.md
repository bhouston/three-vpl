---
sidebar_position: 2
title: Getting started
---

# Getting started

Install the package alongside its compatible Three.js peer dependency:

```bash
npm install three-vpl three@0.186.0
```

The first npm release is pending maintainer publishing setup. Until then, use a checkout of this monorepo and its workspace package.

## TypeScript

The library is written in strict TypeScript and ships compiled ESM JavaScript plus generated declarations. Install `@types/three@~0.186.0` for TypeScript projects. Options and visibility callback types are exported from `three-vpl`:

```ts
import type { VirtualPointLightOptions, VirtualPointLightVisibility } from 'three-vpl';

const options: VirtualPointLightOptions = { count: 128, bounces: 2, seed: 1 };
```

The r186 typings for `lights()` accept only `Light[]`, although Three.js also accepts lighting nodes at runtime. TypeScript callers should use `indirect as unknown as Light` with `import type { Light } from 'three'` when adding the indirect node.

For local development, `pnpm build` compiles the library and builds this website; `pnpm dev` builds the library before starting Docusaurus. After editing library source, rebuild it to refresh the demo. API documentation is generated directly from the TypeScript source.

## Add indirect illumination

```js
import * as THREE from 'three/webgpu';
import { lights } from 'three/tsl';
import { VirtualPointLightGenerator, VirtualPointLightsNode, VirtualPointLightShadowMaps } from 'three-vpl';

// Populate scene with meshes and a PointLight or DirectionalLight.
scene.updateMatrixWorld(true);
const sources = [light];
const generator = new VirtualPointLightGenerator(128);
const shadows = new VirtualPointLightShadowMaps(128);
const indirect = new VirtualPointLightsNode(generator, (start, end, index) => shadows.visibility(start, end, index));

generator.generate(scene, sources, { count: 128, bounces: 2, seed: 1 });
indirect.update();
const lighting = lights([...sources, indirect]);

// Apply to each receiving mesh. Node materials are required.
const material = new THREE.MeshStandardNodeMaterial({ color: 0xcccccc });
material.lightsNode = lighting;
mesh.material = material;

const renderer = new THREE.WebGPURenderer({ antialias: true });
renderer.shadowMap.enabled = true;
await renderer.init();
shadows.update(renderer, scene, generator, indirect.bias.value, 64);
renderer.setAnimationLoop(() => renderer.render(scene, camera));
```

Use a WebGPU-capable browser and a hardware GPU. This website's demo rejects software adapters and reports unavailable WebGPU rather than enabling a software fallback.

## Updating and cleanup

Regenerate samples after relevant scene changes, call `indirect.update()`, and rebuild the visibility maps. Preserve the original source intensities while generating samples if your UI hides direct light.

Stop the animation loop when leaving a scene. Dispose the shadow maps, renderer, geometries, and materials when they are no longer used. See the generated [API reference](./api) for the exported classes and their options.
