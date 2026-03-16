import { spawnSync } from "node:child_process"

export interface CommandResult {
	stdout: string
	stderr: string
	exitCode: number
}

export function runCommandSync(
	command: string,
	args: string[],
	options?: { cwd?: string; env?: NodeJS.ProcessEnv },
): CommandResult {
	const result = spawnSync(command, args, {
		cwd: options?.cwd,
		env: options?.env,
		encoding: "utf-8",
	})
	const errorText = result.error instanceof Error ? `${result.error.message}
` : ""

	return {
		stdout: result.stdout ?? "",
		stderr: `${errorText}${result.stderr ?? ""}`,
		exitCode: result.status ?? 1,
	}
}

export function assertSuccess(result: CommandResult, context: string) {
	if (result.exitCode === 0) return
	const details = [result.stdout.trim(), result.stderr.trim()].filter(Boolean).join("\n")
	throw new Error(`${context} failed${details ? `\n${details}` : ""}`)
}
