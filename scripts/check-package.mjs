import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const cwd = resolve('packages/three-vpl');
const manifest = JSON.parse(readFileSync(resolve(cwd, 'package.json'), 'utf8'));
const output = execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['pack', '--dry-run', '--json'], {
  cwd,
  encoding: 'utf8',
  shell: process.platform === 'win32',
});
const [{ files }] = JSON.parse(output);
const packed = new Set(files.map(({ path }) => path));
for (const entry of [manifest.main, manifest.types, 'LICENSE', 'README.md']) {
  assert.ok(entry, 'Package must declare main and types');
  const path = entry.replace(/^\.\//, '');
  assert.ok(packed.has(path), `Missing ${path} from npm tarball`);
  assert.ok(existsSync(resolve(cwd, path)), `Missing package file: ${path}`);
}
assert.ok(!files.some(({ path }) => /^(test|node_modules|website)\//.test(path)), 'Tarball includes development files');
const api = await import('../packages/three-vpl/dist/index.js');
for (const name of [
  'VirtualPointLightGenerator',
  'VirtualPointLightsNode',
  'VirtualPointLightShadowMaps',
  'VirtualPointLightHelper',
]) {
  assert.equal(typeof api[name], 'function', `Missing public export: ${name}`);
}
console.log(`Verified ${manifest.name}: ${files.length} published files, runtime exports and declarations present.`);
