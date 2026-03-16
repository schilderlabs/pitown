import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { homedir, hostname } from "node:os"
import { join } from "node:path"

interface LeaseData {
	runId: string
	repoId: string
	branch: string
	pid: number
	hostname: string
	startedAt: string
}

function sanitize(value: string): string {
	return value.replace(/[^a-zA-Z0-9._-]+/g, "_")
}

function processAlive(pid: number): boolean {
	if (!Number.isFinite(pid) || pid <= 0) return false
	try {
		process.kill(pid, 0)
		return true
	} catch {
		return false
	}
}

export function acquireRepoLease(runId: string, repoId: string, branch: string): { path: string; release: () => void } {
	const locksDir = join(homedir(), ".pi-town", "locks")
	mkdirSync(locksDir, { recursive: true })

	const leasePath = join(locksDir, `pi-town-${sanitize(repoId)}-${sanitize(branch)}.json`)
	const nextData: LeaseData = {
		runId,
		repoId,
		branch,
		pid: process.pid,
		hostname: hostname(),
		startedAt: new Date().toISOString(),
	}

	try {
		const current = JSON.parse(readFileSync(leasePath, "utf-8")) as LeaseData
		if (processAlive(current.pid)) {
			throw new Error(`Pi Town lease already held by pid ${current.pid} on ${current.hostname} for run ${current.runId}.`)
		}
		rmSync(leasePath, { force: true })
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
			if (error instanceof Error && error.message.startsWith("Pi Town lease already held")) throw error
		}
	}

	writeFileSync(leasePath, `${JSON.stringify(nextData, null, 2)}\n`, "utf-8")

	return {
		path: leasePath,
		release: () => {
			try {
				const current = JSON.parse(readFileSync(leasePath, "utf-8")) as LeaseData
				if (current.runId === runId) rmSync(leasePath, { force: true })
			} catch {
				// ignore cleanup failures
			}
		},
	}
}
