import * as THREE from 'three/webgpu';
import {lights} from 'three/tsl';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {VirtualPointLightGenerator, VirtualPointLightShadowMaps, VirtualPointLightsNode} from 'three-vpl';

export async function createDemo(host: HTMLDivElement, status: (message: string) => void) {
 const gpu = (navigator as any).gpu;
 if (!gpu) throw new Error('WebGPU is not available. Use a recent WebGPU-capable browser with hardware acceleration enabled.');
 const adapter = await gpu.requestAdapter();
 if (!adapter || adapter.isFallbackAdapter) throw new Error('A hardware WebGPU adapter is required.');
 const info = adapter.info || await adapter.requestAdapterInfo?.();
 const identity = `${info?.vendor || ''} ${info?.architecture || ''} ${info?.device || ''} ${info?.description || ''}`;
 if (/swiftshader|llvmpipe|lavapipe|software|warp\b/i.test(identity)) throw new Error('Software GPU adapters are not supported.');
 status('Building virtual emitters and visibility maps…');
 const scene = new THREE.Scene(); scene.background = new THREE.Color(0x101319);
 const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100); camera.position.set(0, 2.5, 8);
 const wall = new THREE.MeshStandardNodeMaterial({color: 0xcccccc});
 const red = new THREE.MeshStandardNodeMaterial({color: 0xe43b41});
 const green = new THREE.MeshStandardNodeMaterial({color: 0x54b872});
 const white = new THREE.MeshStandardNodeMaterial({color: 0xeeeeee});
 const meshes: THREE.Mesh[] = [];
 function mesh(geometry: THREE.BufferGeometry, material: THREE.MeshStandardNodeMaterial, position: number[], rotation: number[] = [0,0,0]) {
  const object = new THREE.Mesh(geometry, material); object.position.set(...position as [number,number,number]); object.rotation.set(...rotation as [number,number,number]); object.receiveShadow = true; object.castShadow = true; scene.add(object); meshes.push(object); return object;
 }
 mesh(new THREE.PlaneGeometry(6,6), wall, [0,0,0], [-Math.PI/2,0,0]);
 mesh(new THREE.PlaneGeometry(6,6), wall, [0,5,0], [Math.PI/2,0,0]);
 mesh(new THREE.PlaneGeometry(6,5), wall, [0,2.5,-3]);
 // The front wall faces into the room and is invisible from the initial camera.
 mesh(new THREE.PlaneGeometry(6,5), wall, [0,2.5,3], [0,Math.PI,0]);
 mesh(new THREE.PlaneGeometry(6,5), red, [-3,2.5,0], [0,Math.PI/2,0]);
 mesh(new THREE.PlaneGeometry(6,5), green, [3,2.5,0], [0,-Math.PI/2,0]);
 mesh(new THREE.BoxGeometry(1.2,2.5,1.2), white, [-0.8,1.25,-0.8], [0,Math.PI/8,0]);
 mesh(new THREE.BoxGeometry(1.2,1.2,1.2), white, [1,0.6,0.5], [0,-Math.PI/6,0]);
 mesh(new THREE.SphereGeometry(0.5,32,24), white, [1,1.9,0.5]);
 const light = new THREE.PointLight(0xffffff,40); light.position.set(0,4.5,0); light.castShadow = true; light.shadow.mapSize.setScalar(256); scene.add(light);
 scene.updateMatrixWorld(true);
 const generator = new VirtualPointLightGenerator(256);
 const shadows = new VirtualPointLightShadowMaps(256);
 const indirect = new VirtualPointLightsNode(generator, (start, end, index) => shadows.visibility(start,end,index));
 const lighting = lights([light, indirect]);
 for (const material of [wall, red, green, white]) material.lightsNode = lighting;
 const renderer = new THREE.WebGPURenderer({antialias: true});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); renderer.shadowMap.enabled = true; renderer.toneMapping = THREE.ACESFilmicToneMapping;
 const controls = new OrbitControls(camera, renderer.domElement); controls.target.set(0,2.5,0); controls.update();
 let disposed = false;
 const dispose = () => {
  if (disposed) return; disposed = true;
  renderer.setAnimationLoop(null); observer.disconnect(); controls.dispose();
  shadows.dispose(); generator.dispose();
  for (const object of meshes) object.geometry.dispose();
  for (const material of [wall, red, green, white]) material.dispose();
  light.shadow.dispose(); renderer.dispose(); renderer.domElement.remove();
 };
 const observer = new ResizeObserver(() => {
  const width = host.clientWidth, height = host.clientHeight;
  camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width,height);
 });
 try {
  await renderer.init();
  // WebGPURenderer can otherwise fall back to WebGL when native initialization fails.
  if (!(renderer.backend as any).isWebGPUBackend) throw new Error('A native WebGPU context could not be created.');
  host.appendChild(renderer.domElement); observer.observe(host);
  renderer.setSize(host.clientWidth,host.clientHeight); camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix();
  let lastCount = 0, lastBounces = 0;
  const update = ({mode,count,bounces}: {mode: string;count: number;bounces: number}) => {
   light.intensity = 40;
   if (lastCount !== count || lastBounces !== bounces) {
    generator.generate(scene,[light],{count,bounces,seed: 1,candidateMultiplier: 4,importanceSampling: true});
    indirect.update(); shadows.update(renderer,scene,generator,indirect.bias.value,32);
    lastCount = count; lastBounces = bounces;
   }
   light.intensity = mode === 'indirect' ? 0 : 40;
   indirect.intensity.value = mode === 'direct' ? 0 : 1;
  };
  update({mode: 'combined',count: 64,bounces: 2});
  renderer.setAnimationLoop(() => {controls.update(); renderer.render(scene,camera);});
  return {update,dispose};
 } catch (error) {dispose(); throw error;}
}
