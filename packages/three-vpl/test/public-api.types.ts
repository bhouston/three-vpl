import type { Light } from 'three';
import { Scene, PointLight, MeshStandardNodeMaterial, WebGPURenderer } from 'three/webgpu';
import { lights } from 'three/tsl';
import {
  VirtualPointLightGenerator,
  VirtualPointLightHelper,
  VirtualPointLightsNode,
  VirtualPointLightShadowMaps,
} from 'three-vpl';
import type { VirtualPointLightOptions, VirtualPointLightVisibility } from 'three-vpl';
const options: VirtualPointLightOptions = { count: 64, bounces: 2 };
// @ts-expect-error bounce count must be numeric
const invalidOptions: VirtualPointLightOptions = { bounces: 'two' };
void invalidOptions;
const scene = new Scene();
const light = new PointLight();
const generator = new VirtualPointLightGenerator(64).generate(scene, [light], options);
const shadowMaps = new VirtualPointLightShadowMaps(64);
const visibility: VirtualPointLightVisibility = (start, end, index) => shadowMaps.visibility(start, end, index);
const node = new VirtualPointLightsNode(generator, visibility);
node.intensity.value = 0.5;
node.update();
const material = new MeshStandardNodeMaterial();
material.lightsNode = lights([light, node as unknown as Light]);
const helper = new VirtualPointLightHelper(generator);
helper.update();
shadowMaps.update(new WebGPURenderer(), scene, generator, node.bias.value);
helper.dispose();
shadowMaps.dispose();
