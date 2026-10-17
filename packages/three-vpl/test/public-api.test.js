import { describe, expect, it } from 'vitest';
import { BackSide, Box3, BoxGeometry, DirectionalLight, Mesh, MeshStandardMaterial, PointLight, Scene, Vector3 } from 'three';
import { VirtualPointLightGenerator, VirtualPointLightHelper, VirtualPointLightsNode, VirtualPointLightShadowMaps } from '../src/index.js';

describe('public API', () => {
  it('validates sampling budgets and physically supported sources', () => {
    expect(() => new VirtualPointLightGenerator(0)).toThrow(RangeError);
    const generator = new VirtualPointLightGenerator(16);
    const scene = new Scene();
    const light = new PointLight();
    expect(() => generator.generate(scene, [light], { count: 17 })).toThrow(RangeError);
    expect(() => generator.generate(scene, [light], { count: 4, bounces: 5 })).toThrow(RangeError);
    expect(() => generator.generate(scene, [light], { count: 4, candidateMultiplier: 0 })).toThrow(RangeError);
    light.decay = 1;
    expect(() => generator.generate(scene, [light], { count: 4 })).toThrow(/inverse-square/);
    expect(() => generator.generate(scene, [new DirectionalLight()], { count: 4 })).toThrow(/bounds/);
  });

  it('samples directional irradiance over world bounds reproducibly', () => {
    const scene = new Scene();
    scene.add(new Mesh(new BoxGeometry(10, 10, 10), new MeshStandardMaterial({ side: BackSide })));
    const light = new DirectionalLight(0xffffff, 2);
    light.position.set(0, 10, 0);
    scene.add(light, light.target);
    const generator = new VirtualPointLightGenerator(32);
    const options = { count: 32, seed: 3, bounds: new Box3(new Vector3(-5, -5, -5), new Vector3(5, 5, 5)) };
    generator.generate(scene, [light], options);
    expect(generator.count).toBe(32);
    const first = generator.positions.map(position => position.toArray());
    const total = generator.flux.reduce((sum, flux) => sum.add(flux), new Vector3());
    expect(total.x).toBeCloseTo(200, 10);
    generator.generate(scene, [light], options);
    expect(generator.positions.map(position => position.toArray())).toEqual(first);
  });

  it('synchronizes helper and lighting counts after regeneration without a GPU', () => {
    const generator = new VirtualPointLightGenerator(4);
    const helper = new VirtualPointLightHelper(generator);
    const node = new VirtualPointLightsNode(generator);
    const shadows = new VirtualPointLightShadowMaps(4);
    expect(helper.count).toBe(0);
    generator.count = 2;
    generator.positions[0].set(1, 2, 3);
    helper.update();
    node.update();
    expect(helper.count).toBe(2);
    expect(node.count.value).toBe(2);
    expect(shadows.target.width).toBe(1);
    helper.dispose();
    shadows.dispose();
  });
});
