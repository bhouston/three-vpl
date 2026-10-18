import { copyFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

/** Stages release notes before versioning, then packs the versioned package. */
export function prepare({ artifacts } = {}, { cwd, env }) {
  const packageDir = join(cwd, 'packages', 'three-vpl');
  if (!artifacts) {
    copyFileSync(join(cwd, 'CHANGELOG.md'), join(packageDir, 'CHANGELOG.md'));
    return;
  }
  const destination = join(cwd, 'release-artifacts');
  mkdirSync(destination, { recursive: true });
  // pnpm pack ignores a positional package directory; set its working directory.
  execFileSync(
    process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    ['--dir', packageDir, 'pack', '--pack-destination', destination],
    { cwd, env, stdio: 'inherit', shell: process.platform === 'win32' },
  );
}
