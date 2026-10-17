export default {
  branches: ['main'],
  tagFormat: 'v${version}',
  plugins: [
    ['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
    ['@semantic-release/release-notes-generator', { preset: 'conventionalcommits' }],
    ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
    './scripts/prepare-release.mjs',
    ['@anolilab/semantic-release-pnpm', { pkgRoot: 'packages/three-vpl' }],
    ['./scripts/prepare-release.mjs', { artifacts: true }],
    ['@semantic-release/github', {
      successComment: false,
      failComment: false,
      releasedLabels: false,
      assets: ['release-artifacts/*.tgz', 'CHANGELOG.md'],
    }],
  ],
};
