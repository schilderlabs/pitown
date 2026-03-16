# @schilderlabs/pitown

The globally installable Pi Town CLI.

## Install

```bash
npm install -g @schilderlabs/pitown
```

## Usage

```bash
pitown --help
pitown run --repo /path/to/repo --plan /path/to/private/plans --goal "continue from current scaffold state"
pitown status
```

## Runtime storage

Pi Town stores local runtime state under `~/.pi-town` by default and keeps private plans outside the target repo.
