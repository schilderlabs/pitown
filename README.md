# Pi Town

Pi Town is a Pi-native night-shift system for unattended software work.

It combines two layers in one monorepo:
- a **headless runtime** for orchestration, monitoring, and optimization
- an installable **Pi package** with extensions, prompts, and bundled agent assets

## Why

Pi Town is built for a day-shift / night-shift workflow.

### Day shift
Humans do the high-leverage work:
- gather requirements
- write specs
- make architectural decisions
- improve docs
- tighten validations and tests
- review the overnight output

### Night shift
Agents do bounded execution:
- gather context
- plan
- implement
- review
- validate
- summarize progress

The goal is not to babysit a live loop.
The goal is to come back to reviewed progress, understandable blockers, and a system that improves over time.

## Monorepo shape

```text
packages/
  eslint-config/     shared workspace ESLint config
  typescript-config/ shared workspace TypeScript config
  core/              orchestration and runtime primitives
  cli/               installable CLI
  pi-package/        optional Pi package resources
```

## Packages

### `@schilderlabs/pitown`
The primary public install target. It exposes the `pitown` command.

### `@schilderlabs/pitown-core`
Shared runtime primitives and metrics computation.

### `@schilderlabs/pitown-package`
An optional Pi-installable package containing extensions, prompts, and bundled agent markdown assets.

## Install from source

```bash
pnpm install
pnpm build
pnpm pitown -- --help
pnpm town:run -- --repo /path/to/repo --plan /path/to/private/plans --goal "continue from current scaffold state"
```

## Public install target

Once published, the intended install flow is:

```bash
npm install -g @schilderlabs/pitown
pitown --help
pitown run --repo /path/to/repo --plan /path/to/private/plans --goal "continue from current scaffold state"
```

## Local-first runtime model

Pi Town targets arbitrary local repositories with explicit flags:
- `--repo`
- `--plan`
- `--goal`

Runtime state and durable run artifacts default to `~/.pi-town`, for example:

```text
~/.pi-town/
  config.json
  repos/
    <repo-slug>/
      latest/
      runs/
        <run-id>/
```

Private plans are intended to stay outside the target repo and are recommended under:

```text
~/.pi-town/plans/<repo-slug>/
```

## Notes

- detailed working plans are intentionally kept outside this repo
- the target repo is passed explicitly with `--repo`
- private plans are passed explicitly with `--plan` or recommended under `~/.pi-town/plans/<repo-slug>/`
- this repo is meant to stay clean enough for public GitHub
- frontend UI is intentionally out of scope for the initial scaffold
