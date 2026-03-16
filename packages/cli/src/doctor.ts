import { createPiAuthHelpMessage, detectPiAuthFailure, runCommandSync } from "../../core/src/index.js"
import { isDirectExecution } from "./entrypoint.js"

export interface DoctorResult {
	ok: boolean
}

export function runDoctor(): DoctorResult {
	console.log("[pitown] doctor")

	const availability = runCommandSync("pi", ["--help"])
	if (availability.exitCode !== 0) {
		console.log("- pi cli: missing")
		console.log("- install: npm install -g @mariozechner/pi-coding-agent")
		console.log('- verify: pi -p "hello"')
		return { ok: false }
	}

	const check = runCommandSync("pi", ["--no-session", "-p", "hello"])
	if (check.exitCode === 0) {
		console.log("- pi cli: installed")
		console.log("- pi auth: ready")
		console.log("- status: ok")
		return { ok: true }
	}

	if (detectPiAuthFailure(check.stderr, check.stdout)) {
		console.log("- pi cli: installed")
		console.log("- pi auth: not ready")
		console.log(`- note: ${createPiAuthHelpMessage()}`)
		return { ok: false }
	}

	console.log("- pi cli: installed")
	console.log("- pi check: failed")
	if (check.stderr.trim()) console.log(`- stderr: ${check.stderr.trim()}`)
	else if (check.stdout.trim()) console.log(`- stdout: ${check.stdout.trim()}`)
	return { ok: false }
}

if (isDirectExecution(import.meta.url)) {
	const result = runDoctor()
	if (!result.ok) process.exitCode = 1
}
