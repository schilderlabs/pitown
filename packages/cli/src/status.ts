import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { createRepoSlug, getRepoIdentity, getRepoRoot } from "../../core/src/index.js"
import { parseCliFlags } from "./config.js"
import {
	getLatestRunPointerPath,
	getRepoArtifactsDir,
	getRepoLatestRunPointerPath,
	getTownHomeDir,
} from "./paths.js"

interface LatestRunPointer {
	repoSlug: string
	repoRoot: string
	runId?: string
	runDir?: string
	latestDir: string
	manifestPath: string
	metricsPath: string
	summaryPath: string
	updatedAt?: string
}

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, "utf-8")) as T
}

function createFallbackPointer(repoRoot: string, repoSlug: string): LatestRunPointer {
	const latestDir = join(getRepoArtifactsDir(repoSlug), "latest")
	return {
		repoSlug,
		repoRoot,
		latestDir,
		manifestPath: join(latestDir, "manifest.json"),
		metricsPath: join(latestDir, "metrics.json"),
		summaryPath: join(latestDir, "run-summary.json"),
	}
}

export function resolveLatestRunPointer(argv = process.argv.slice(2)): LatestRunPointer | null {
	const flags = parseCliFlags(argv)

	if (flags.repo) {
		const repoRoot = getRepoRoot(flags.repo)
		const repoSlug = createRepoSlug(getRepoIdentity(repoRoot), repoRoot)
		const repoPointerPath = getRepoLatestRunPointerPath(repoSlug)
		if (existsSync(repoPointerPath)) return readJson<LatestRunPointer>(repoPointerPath)
		return createFallbackPointer(repoRoot, repoSlug)
	}

	const latestPointerPath = getLatestRunPointerPath()
	if (!existsSync(latestPointerPath)) return null
	return readJson<LatestRunPointer>(latestPointerPath)
}

export function showTownStatus(argv = process.argv.slice(2)) {
	const latest = resolveLatestRunPointer(argv)
	console.log("[pitown] status")
	console.log(`- town home: ${getTownHomeDir()}`)

	if (latest === null) {
		console.log("- no local runs found yet")
		console.log(`- expected pointer: ${getLatestRunPointerPath()}`)
		return
	}

	if (existsSync(latest.summaryPath)) {
		const summary = readJson<{
			runId?: string
			mode?: string
			message?: string
			piExitCode?: number
		}>(latest.summaryPath)
		if (summary.runId) console.log(`- latest run: ${summary.runId}`)
		if (summary.mode) console.log(`- mode: ${summary.mode}`)
		if (summary.piExitCode !== undefined) console.log(`- pi exit code: ${summary.piExitCode}`)
		if (summary.message) console.log(`- note: ${summary.message}`)
	}

	if (existsSync(latest.manifestPath)) {
		const manifest = readJson<{
			repoRoot?: string
			branch?: string
			goal?: string | null
			planPath?: string | null
			recommendedPlanDir?: string | null
			stopReason?: string | null
		}>(latest.manifestPath)
		if (manifest.repoRoot) console.log(`- repo root: ${manifest.repoRoot}`)
		if (manifest.branch) console.log(`- branch: ${manifest.branch}`)
		if (manifest.goal) console.log(`- goal: ${manifest.goal}`)
		if (manifest.planPath) console.log(`- plan path: ${manifest.planPath}`)
		if (!manifest.planPath && manifest.recommendedPlanDir) {
			console.log(`- recommended plans: ${manifest.recommendedPlanDir}`)
		}
		if (manifest.stopReason) console.log(`- stop reason: ${manifest.stopReason}`)
	}

	if (!existsSync(latest.metricsPath)) {
		console.log("- no metrics snapshot found yet")
		console.log(`- expected path: ${latest.metricsPath}`)
		return
	}

	console.log(`- metrics file: ${latest.metricsPath}`)
	console.log(readFileSync(latest.metricsPath, "utf-8").trim())
}

if (import.meta.url === `file://${process.argv[1]}`) {
	showTownStatus()
}
