import { existsSync, watchFile } from "node:fs"
import { getTownHomeDir } from "./paths.js"
import { resolveLatestRunPointer, showTownStatus } from "./status.js"

export function watchTown(argv = process.argv.slice(2)) {
	const latest = resolveLatestRunPointer(argv)
	const metricsPath = latest?.metricsPath

	console.log("[pitown] watch")
	console.log(`- town home: ${getTownHomeDir()}`)
	console.log("- press Ctrl+C to stop")
	showTownStatus(argv)

	if (!metricsPath || !existsSync(metricsPath)) {
		console.log("- metrics file does not exist yet; watch will activate after the first run")
		return
	}

	watchFile(metricsPath, { interval: 1000 }, () => {
		console.log("\n[pitown] metrics updated")
		showTownStatus(argv)
	})
}

if (import.meta.url === `file://${process.argv[1]}`) {
	watchTown()
}
