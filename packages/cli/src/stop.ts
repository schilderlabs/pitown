import { existsSync, readdirSync } from "node:fs"
import {
	getRepoIdentity,
	stopManagedAgents,
	stopRepoLeases,
} from "../../core/src/index.js"
import { normalizeAgentId } from "./agent-id.js"
import { parseOptionalRepoFlag } from "./config.js"
import { getRepoArtifactsDir, getReposRootDir } from "./paths.js"
import { resolveRepoContext } from "./repo-context.js"

interface StopFlags {
	all: boolean
	agentId: string | null
	force: boolean
}

interface StopRepoSummary {
	repoLabel: string
	stoppedAgents: number
	signaledAgentProcesses: number
	signaledLeaseProcesses: number
}

function parseStopFlags(argv: string[]): StopFlags {
	let all = false
	let agentId: string | null = null
	let force = false

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index]
		if (arg === undefined) continue

		if (arg === "--all") {
			all = true
			continue
		}

		if (arg === "--force") {
			force = true
			continue
		}

		if (arg.startsWith("--agent=")) {
			agentId = normalizeAgentId(arg.slice("--agent=".length))
			continue
		}

		if (arg === "--agent") {
			const value = argv[index + 1]
			if (!value) throw new Error("Missing value for --agent")
			agentId = normalizeAgentId(value)
			index += 1
			continue
		}

		throw new Error(`Unknown argument: ${arg}`)
	}

	return { all, agentId, force }
}

function stopRepo(repoRoot: string, artifactsDir: string, flags: StopFlags): StopRepoSummary {
	const repoId = getRepoIdentity(repoRoot)
	const leaseResult = flags.agentId ? { signaledProcesses: 0 } : stopRepoLeases({ repoId, force: flags.force })
	const agentResult = stopManagedAgents({
		artifactsDir,
		agentId: flags.agentId,
		actorId: "human",
		reason: flags.agentId ? `Stopped ${flags.agentId} via pitown stop` : "Stopped via pitown stop",
		force: flags.force,
	})

	return {
		repoLabel: repoRoot,
		stoppedAgents: agentResult.stoppedAgents,
		signaledAgentProcesses: agentResult.signaledProcesses,
		signaledLeaseProcesses: leaseResult.signaledProcesses,
	}
}

function listTrackedArtifactsDirs(): string[] {
	const reposRoot = getReposRootDir()
	if (!existsSync(reposRoot)) return []

	return readdirSync(reposRoot)
		.map((entry) => getRepoArtifactsDir(entry))
		.filter((path) => existsSync(path))
}

export function stopTown(argv = process.argv.slice(2)): StopRepoSummary[] {
	const { repo, rest } = parseOptionalRepoFlag(argv)
	const flags = parseStopFlags(rest)

	if (flags.all && repo) throw new Error("Do not combine --all with --repo")
	if (flags.all && flags.agentId) throw new Error("Do not combine --all with --agent")

	if (flags.all) {
		const repoSummaries = listTrackedArtifactsDirs().map((artifactsDir) => ({
			repoLabel: artifactsDir,
			...stopManagedAgents({
				artifactsDir,
				actorId: "human",
				reason: "Stopped via pitown stop --all",
				force: flags.force,
			}),
			signaledLeaseProcesses: 0,
		}))
		const leaseResult = stopRepoLeases({ force: flags.force })
		const totalAgents = repoSummaries.reduce((sum, result) => sum + result.stoppedAgents, 0)
		const totalAgentProcesses = repoSummaries.reduce((sum, result) => sum + result.signaledAgentProcesses, 0)
		const totalLeaseProcesses =
			leaseResult.signaledProcesses + repoSummaries.reduce((sum, result) => sum + result.signaledLeaseProcesses, 0)

		console.log("[pitown] stop")
		console.log("- scope: all repos")
		console.log(`- stopped agents: ${totalAgents}`)
		console.log(`- signaled agent processes: ${totalAgentProcesses}`)
		console.log(`- signaled lease processes: ${totalLeaseProcesses}`)
		if (repoSummaries.length === 0 && leaseResult.results.length === 0) console.log("- nothing was running")
		return repoSummaries
	}

	const resolved = repo ? resolveRepoContext(["--repo", repo]) : resolveRepoContext([])
	const result = stopRepo(resolved.repoRoot, resolved.artifactsDir, flags)

	console.log("[pitown] stop")
	console.log(`- repo root: ${result.repoLabel}`)
	if (flags.agentId) console.log(`- agent: ${flags.agentId}`)
	console.log(`- stopped agents: ${result.stoppedAgents}`)
	console.log(`- signaled agent processes: ${result.signaledAgentProcesses}`)
	if (!flags.agentId) console.log(`- signaled lease processes: ${result.signaledLeaseProcesses}`)
	if (result.stoppedAgents === 0 && result.signaledAgentProcesses === 0 && result.signaledLeaseProcesses === 0) {
		console.log("- nothing was running")
	}

	return [result]
}
