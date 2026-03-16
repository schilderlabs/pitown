# Publishing Pi Town

Recommended public distribution strategy:

- **primary registry:** npmjs
- **secondary registry:** GitHub Packages
- **primary install command:** `npm install -g @schilderlabs/pitown`
- **primary CLI command:** `pitown`

## Packages

Primary published packages:

- `@schilderlabs/pitown-core`
- `@schilderlabs/pitown`

Optional later:

- `@schilderlabs/pitown-package`

## Default release flow

Pi Town now supports automated publishing from GitHub Actions on version tags.

### Required GitHub secret

Add this repository secret first:

- `NPM_TOKEN` — npm token with publish access for the `@schilderlabs` scope

GitHub Packages publishing uses `GITHUB_TOKEN` automatically.

## Tag-driven releases

Push one of these tags:

- `pitown-core-v<version>`
- `pitown-v<version>`

Examples:

```bash
git tag pitown-core-v0.1.1
git push origin pitown-core-v0.1.1

git tag pitown-v0.1.2
git push origin pitown-v0.1.2
```

The release workflow will then:

1. install dependencies
2. run tests
3. build packages
4. verify the tag version matches the target package `package.json`
5. publish the package to npmjs
6. publish the same package to GitHub Packages
7. create a GitHub Release

## Versioning rule

Before pushing a release tag, make sure the relevant `package.json` already has the same version.

Examples:

- `packages/core/package.json` version `0.1.1` ↔ tag `pitown-core-v0.1.1`
- `packages/cli/package.json` version `0.1.2` ↔ tag `pitown-v0.1.2`

If they do not match, the workflow will fail intentionally.

## Manual fallback

You can still publish manually from the workspace root if needed:

```bash
pnpm --filter @schilderlabs/pitown-core publish --access public
pnpm --filter @schilderlabs/pitown publish --access public
```

## Why npmjs first

npmjs gives the cleanest public CLI experience:

- no custom registry flags
- no GitHub Packages auth friction for most users
- works naturally with `npm install -g` and `npx`

## Why also publish to GitHub Packages

Publishing to GitHub Packages makes the package appear in the GitHub org and repo package UI.

That is useful for discoverability and a clean GitHub presence, but it remains a secondary distribution channel.

## Metadata to keep aligned

- GitHub org: `schilderlabs`
- GitHub repo: `pitown`
- npm scope: `@schilderlabs`
- install package: `@schilderlabs/pitown`
- command: `pitown`
