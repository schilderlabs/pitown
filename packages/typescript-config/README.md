# @schilderlabs/typescript-config

Internal TypeScript configuration package for the Pi Town workspace.

In this monorepo the package configs are typically referenced via relative paths, for example:

```json
{
	"extends": "../typescript-config/strict-jit.json",
	"compilerOptions": {
		"outDir": "./dist",
		"rootDir": "./src"
	},
	"include": ["src/**/*"]
}
```
