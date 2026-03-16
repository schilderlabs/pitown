import { defineConfig } from "tsdown"

export default defineConfig({
	entry: ["src/index.ts", "src/doctor.ts", "src/run.ts", "src/status.ts", "src/watch.ts"],
	format: ["esm"],
	dts: true,
	clean: true,
	sourcemap: true,
})
