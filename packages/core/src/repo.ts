import { createHash } from "node:crypto"
import { existsSync } from "node:fs"
import { basename, resolve } from "node:path"
import { assertSuccess, runCommandSync } from "./shell.js"

function gitResult(cwd: string, args: string[]) {
	return runCommandSync("git", args, { cwd })
}

function sanitize(value: string): string {
	return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "repo"
}

export function isGitRepo(cwd: string): boolean {
	const result = gitResult(cwd, ["rev-parse", "--is-inside-work-tree"])
	return result.exitCode === 0 && result.stdout.trim() === "true"
}

export function getRepoRoot(cwd: string): string {
	if (!isGitRepo(cwd)) return resolve(cwd)
	const result = gitResult(cwd, ["rev-parse", "--show-toplevel"])
	assertSuccess(result, "git rev-parse --show-toplevel")
	return resolve(result.stdout.trim())
}

export function getCurrentBranch(cwd: string): string | null {
	if (!isGitRepo(cwd)) return null
	const result = gitResult(cwd, ["rev-parse", "--abbrev-ref", "HEAD"])
	if (result.exitCode !== 0) return null
	const branch = result.stdout.trim()
	return branch || null
}

export function getRepoIdentity(cwd: string): string {
	if (!isGitRepo(cwd)) return resolve(cwd)

	const remote = gitResult(cwd, ["config", "--get", "remote.origin.url"])
	const remoteValue = remote.stdout.trim()
	if (remote.exitCode === 0 && remoteValue) return remoteValue

	const root = gitResult(cwd, ["rev-parse", "--show-toplevel"])
	assertSuccess(root, "git rev-parse --show-toplevel")
	const commonDir = gitResult(cwd, ["rev-parse", "--git-common-dir"])
	assertSuccess(commonDir, "git rev-parse --git-common-dir")

	const rootPath = resolve(root.stdout.trim())
	const commonDirPath = commonDir.stdout.trim()
	return `${basename(rootPath)}:${rootPath}:${existsSync(commonDirPath) ? resolve(commonDirPath) : commonDirPath}`
}

export function createRepoSlug(repoId: string, repoRoot: string): string {
	const name = sanitize(basename(repoRoot))
	const digest = createHash("sha1").update(repoId).digest("hex").slice(0, 8)
	return `${name}-${digest}`
}
