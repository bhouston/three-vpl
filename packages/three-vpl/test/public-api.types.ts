import type { Light } from 'three';
import { Scene, PointLight, MeshStandardNodeMaterial, WebGPURenderer } from 'three/webgpu';
import { lights } from 'three/tsl';
import { VirtualPointLightGenerator, VirtualPointLightHelper, VirtualPointLightsNode, VirtualPointLightShadowMaps } from '../src/index.js';
const scene = new Scene();
const light = new PointLight();
const generator = new VirtualPointLightGenerator(64).generate(scene, [light], { count: 64, bounces: 2 });
const shadowMaps = new VirtualPointLightShadowMaps(64);
const node = new VirtualPointLightsNode(generator, (start, end, index) => shadowMaps.visibility(start, end, index));
node.intensity.value = 0.5;
node.update();
const material = new MeshStandardNodeMaterial();
material.lightsNode = lights([light, node as unknown as Light]);
const helper = new VirtualPointLightHelper(generator);
helper.update();
shadowMaps.update(new WebGPURenderer(), scene, generator, node.bias.value);
helper.dispose();
shadowMaps.dispose();

