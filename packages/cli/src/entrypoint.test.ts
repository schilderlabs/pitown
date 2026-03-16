import { mkdtempSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { describe, expect, it } from "vitest"
import { isDirectExecution } from "./entrypoint.js"

describe("isDirectExecution", () => {
	it("treats a symlinked npm bin path as a direct execution of the target module", () => {
		const dir = mkdtempSync(join(tmpdir(), "pitown-entrypoint-"))
		const target = join(dir, "index.mjs")
		const symlink = join(dir, "pitown")
		writeFileSync(target, "#!/usr/bin/env node\n", "utf-8")
		symlinkSync(target, symlink)

		expect(isDirectExecution(pathToFileURL(target).href, symlink)).toBe(true)
	})

	it("returns false for a different module path", () => {
		const dir = mkdtempSync(join(tmpdir(), "pitown-entrypoint-"))
		const target = join(dir, "index.mjs")
		const other = join(dir, "other.mjs")
		writeFileSync(target, "", "utf-8")
		writeFileSync(other, "", "utf-8")

		expect(isDirectExecution(pathToFileURL(target).href, other)).toBe(false)
	})
})
