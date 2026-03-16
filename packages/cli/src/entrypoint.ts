import { realpathSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

function normalizePath(path: string | undefined): string | null {
	if (!path) return null
	try {
		return realpathSync(path)
	} catch {
		return resolve(path)
	}
}

export function isDirectExecution(fileUrl: string, argv1 = process.argv[1]): boolean {
	const modulePath = normalizePath(fileURLToPath(fileUrl))
	const invokedPath = normalizePath(argv1)
	return modulePath !== null && invokedPath !== null && modulePath === invokedPath
}
