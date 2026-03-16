# Publishing Pi Town

Recommended public distribution strategy:

- **primary registry:** npmjs
- **secondary registry:** GitHub Packages
- **primary install command:** `npm install -g @schilderlabs/pitown`
- **primary CLI command:** `pitown`

## Packages

Publish these first:

- `@schilderlabs/pitown-core`
- `@schilderlabs/pitown`

Optional later:

- `@schilderlabs/pitown-package`

## Why npmjs first

npmjs gives the cleanest public CLI experience:

- no custom registry flags
- no GitHub Packages auth friction for most users
- works naturally with `npm install -g` and `npx`

## Why also publish to GitHub Packages

Publishing to GitHub Packages makes the package appear in the GitHub org and repo package UI.

That is useful for discoverability and a clean GitHub presence, but it should stay a secondary distribution channel.

## Suggested release order

1. publish `@schilderlabs/pitown-core` to npmjs
2. publish `@schilderlabs/pitown` to npmjs
3. publish the same versions to GitHub Packages
4. create a GitHub Release
5. add Homebrew later once npm publishing is stable

## Example npm publish commands

From the workspace root:

```bash
pnpm --filter @schilderlabs/pitown-core build
pnpm --filter @schilderlabs/pitown build

pnpm --filter @schilderlabs/pitown-core publish --access public
pnpm --filter @schilderlabs/pitown publish --access public
```

## Example GitHub Packages publish commands

```bash
pnpm --filter @schilderlabs/pitown-core publish --registry https://npm.pkg.github.com
pnpm --filter @schilderlabs/pitown publish --registry https://npm.pkg.github.com
```

## Metadata to keep aligned

- GitHub org: `schilderlabs`
- GitHub repo: `pitown`
- npm scope: `@schilderlabs`
- install package: `@schilderlabs/pitown`
- command: `pitown`
