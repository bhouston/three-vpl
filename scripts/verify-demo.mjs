import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.DEMO_URL || 'http://127.0.0.1:4100/three-vpl/';
const artifacts = resolve(process.env.SWARM_ARTIFACTS || 'test-results');
mkdirSync(artifacts, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || 'chrome',
  headless: true,
  args: ['--disable-software-rasterizer'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.addInitScript(() => {
    globalThis.__verificationDevices = [];
    if (!globalThis.GPUAdapter) return;
    const original = GPUAdapter.prototype.requestDevice;
    GPUAdapter.prototype.requestDevice = async function (...args) {
      const device = await original.apply(this, args);
      globalThis.__verificationDevices.push(device);
      return device;
    };
  });
  await page.goto(base);
  const hardware = await page.evaluate(async () => {
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter || adapter.isFallbackAdapter) throw new Error('No hardware WebGPU adapter');
    const { vendor, architecture, device, description } = adapter.info;
    const identity = { vendor, architecture, device, description };
    if (!vendor || /swiftshader|llvmpipe|lavapipe|software|warp\b/i.test(JSON.stringify(identity))) {
      throw new Error(`Physical GPU identity not confirmed: ${JSON.stringify(identity)}`);
    }
    return identity;
  });
  console.log('Physical adapter:', hardware);
  await page.screenshot({ path: resolve(artifacts, 'website-home.png'), fullPage: true });
  await page.getByRole('link', { name: 'Explore the live demo' }).click();
  await page.waitForFunction(
    () => {
      const status = document.querySelector('.demo-status')?.textContent || '';
      return status.startsWith('Drag to orbit') || status.startsWith('Rendering unavailable:');
    },
    null,
    { timeout: 120000 },
  );
  assert.match(await page.locator('.demo-status').textContent(), /^Drag to orbit/, 'WebGPU demo initialized');
  const completed = async () => {
    await page.evaluate(async () => {
      await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
      await Promise.all(globalThis.__verificationDevices.map((device) => device.queue.onSubmittedWorkDone()));
    });
  };
  const controls = page.locator('.demo-controls select');
  const images = new Map();
  for (const mode of ['combined', 'direct', 'indirect']) {
    await controls.nth(0).selectOption(mode);
    await completed();
    images.set(mode, await page.locator('.demo-canvas canvas').screenshot());
    await page.screenshot({ path: resolve(artifacts, `demo-${mode}.png`), fullPage: true });
  }
  assert.notDeepEqual(
    images.get('combined'),
    images.get('direct'),
    'Indirect illumination must change the rendered canvas',
  );
  assert.notDeepEqual(images.get('direct'), images.get('indirect'), 'Lighting modes must produce different images');
  await controls.nth(1).selectOption('128');
  await controls.nth(2).selectOption('3');
  await completed();
  await controls.nth(1).selectOption('256');
  await controls.nth(2).selectOption('4');
  await completed();
  await page.screenshot({ path: resolve(artifacts, 'demo-high-budget.png'), fullPage: true });
  await page.goto(`${base}docs/api/`);
  await page.getByRole('main').getByRole('link', { name: 'VirtualPointLightGenerator', exact: true }).first().waitFor();
  await page.screenshot({ path: resolve(artifacts, 'api-reference.png'), fullPage: true });
  assert.deepEqual(errors, [], 'Browser errors');
  writeFileSync(
    resolve(artifacts, 'render-verification.json'),
    JSON.stringify(
      { base, hardware, errors, modes: ['combined', 'direct', 'indirect'], maxBudget: 256, maxBounces: 4 },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
