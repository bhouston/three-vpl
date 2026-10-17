# Publishing

## One-time maintainer setup

The public repository, CI and Pages website work before the npm package exists. The first npm publication needs the maintainer's existing interactive npm login and two-factor authentication. No npm token is stored in this repository.

1. Merge the bootstrap PR after checks pass. Build and inspect that commit:

   ```sh
   pnpm install --frozen-lockfile
   pnpm build
   pnpm package:check
   pnpm --dir packages/three-vpl pack --pack-destination ../../release-artifacts
   ```

2. Using your existing npm account, publish the inspected tarball with `npm publish <tarball-path> --access public`. This is the one-time bootstrap exception to automated versioning. The source package starts at `0.1.0`; do not publish the same version twice.
3. In npm **Settings → Trusted publishing**, add **GitHub Actions**:

   | Field | Value |
   | --- | --- |
   | Organization or user | `bhouston` |
   | Repository | `three-vpl` |
   | Workflow filename | `release.yml` |
   | Environment | `npm` |
   | Allowed action | Publish |

   See [npm's instructions](https://docs.npmjs.com/trusted-publishers/). The workflow uses the matching `npm` GitHub environment and `id-token: write`. GitHub-hosted runners supply OIDC identity and npm provenance automatically.
4. Associate the initial published version with its exact source commit: create the `v0.1.0` tag and GitHub Release for the merged commit you published. This is the one-time exception to the normal rule against manual release tags. Do this before later release-worthy commits, so semantic-release continues from the published version rather than proposing its default first release, `1.0.0`.
5. Run `gh workflow run release.yml --ref main -f dry_run=true`. With no new release-worthy commits this is a successful no-op. Preview again after the next feature or fix merges to inspect the next planned version.

## Subsequent releases

Merging does not publish npm packages. Dispatch `release.yml` on `main` when ready. The workflow validates the exact commit, rejects stale dispatches, then semantic-release determines the next version from Conventional Commits. It updates only the CI checkout, creates the tag and GitHub Release, attaches the tarball and changelog, and publishes via npm trusted publishing. Do not manually change versions, tags or changelogs after bootstrap.

```sh
gh workflow run release.yml --ref main -f dry_run=true
gh workflow run release.yml --ref main
```

If npm setup is incomplete, use dry runs; an actual publish will fail. The bootstrap task does not publish npm or dispatch an actual release.

## Website deployment

`pages.yml` uploads the Docusaurus output at `packages/website/build` with `actions/upload-pages-artifact` and deploys it with `actions/deploy-pages`. Pages uses **GitHub Actions** as its source. Normal deployments follow pushes to `main` or manual dispatch on `main`; there is no `gh-pages` branch or Google Cloud service.
