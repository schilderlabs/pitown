import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

export function appendJsonl(filePath: string, value: unknown) {
	mkdirSync(dirname(filePath), { recursive: true })
	writeFileSync(filePath, `${JSON.stringify(value)}\n`, { encoding: "utf-8", flag: "a" })
}

export function readJsonl<T>(filePath: string): T[] {
	try {
		const raw = readFileSync(filePath, "utf-8")
		return raw
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line) => JSON.parse(line) as T)
	} catch {
		return []
	}
}
