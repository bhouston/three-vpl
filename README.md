# three-vpl

Diffuse global illumination for Three.js using **Instant Radiosity / virtual point lights**. Deterministic CPU light paths place secondary emitters on surfaces; a Three.js node evaluates indirect lighting with optional cached GPU visibility.

- [Documentation, API reference and interactive WebGPU demo](https://bhouston.github.io/three-vpl/)
- [Original implementation: three.js PR #34915](https://github.com/mrdoob/three.js/pull/34915)
- [Contributing](CONTRIBUTING.md) and [initial npm publishing setup](PUBLISHING.md)

This is an independent project, not an official Three.js package. The initial npm publication is pending maintainer setup. Until then use the repository workspace or build a package tarball locally.

## Workspace

| Directory            | Purpose                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| `packages/three-vpl` | Publishable ESM package, JSDoc, TypeScript declarations and CPU tests   |
| `packages/website`   | Docusaurus documentation, generated API reference and interactive demo  |
| `.github/workflows`  | CI, Pages artifact deployment and manually dispatched semantic releases |

Use Node 26 and pnpm 11.27.0 (pinned in `.nvmrc` and `package.json`):

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm tsc
pnpm lint
pnpm test
pnpm package:check
pnpm dev
```

The website is a static GitHub Pages artifact requiring no server or cloud credentials. API documentation is generated from the documented public API during the website build.

## Technique

Alexander Keller's [Instant Radiosity (SIGGRAPH 1997)](https://doi.org/10.1145/258734.258769) approximates indirect illumination with virtual point lights along sampled light paths. Surface emitters capture color bleeding without a regular probe grid; cached visibility lets camera movement reuse the bake. Cost scales with active VPLs per fragment. Low budgets can be noisy and distance clamping sacrifices near-field energy to control singularities.

Transport is diffuse and assumes static geometry. Regenerate samples and visibility when source lights, materials or geometry change. CPU sampling does not evaluate skinning, instancing, normal maps or texture mip selection. WebGPU rendering needs a supported browser and physical GPU; software renderers are not used for verification.

## License and provenance

MIT. Extracted from Ben Houston's [Three.js contribution](https://github.com/mrdoob/three.js/pull/34915), retaining the Three.js authors' license. Workspace and release conventions follow [three-ntc](https://github.com/bhouston/three-ntc); Docusaurus and Pages artifact deployment follow [git-dedup](https://github.com/bhouston/git-dedup).
