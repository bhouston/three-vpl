import assert from 'node:assert/strict';
import { test } from 'node:test';
import config from '../release.config.js';
import { prepare } from './prepare-release.mjs';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('release stages the generated changelog in the npm package', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'three-vpl-release-'));
  try {
    mkdirSync(join(cwd, 'packages', 'three-vpl'), { recursive: true });
    writeFileSync(join(cwd, 'CHANGELOG.md'), '# Release notes\n');
    prepare({}, { cwd, env: process.env });
    assert.equal(readFileSync(join(cwd, 'packages', 'three-vpl', 'CHANGELOG.md'), 'utf8'), '# Release notes\n');
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test('release versions before packing and publishes only the library', () => {
  assert.deepEqual(config.branches, ['main']);
  const publishing = config.plugins.filter((plugin) => Array.isArray(plugin) && plugin[0].includes('release-pnpm'));
  assert.deepEqual(publishing, [['@anolilab/semantic-release-pnpm', { pkgRoot: 'packages/three-vpl' }]]);
  assert.ok(config.plugins.findIndex((p) => Array.isArray(p) && p[1]?.artifacts) > config.plugins.indexOf(publishing[0]));
});
