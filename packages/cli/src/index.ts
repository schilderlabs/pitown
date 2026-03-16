#!/usr/bin/env node

import { runDoctor } from "./doctor.js"
import { isDirectExecution } from "./entrypoint.js"
import { runTown } from "./run.js"
import { showTownStatus } from "./status.js"
import { watchTown } from "./watch.js"

export function printHelp() {
	console.log(
		[
			"pitown",
			"",
			"Usage:",
			"  pitown run [--repo <path>] [--plan <path>] [--goal <text>]",
			"  pitown status [--repo <path>]",
			"  pitown watch [--repo <path>]",
			"  pitown doctor",
			"  pitown help",
			"  pitown --help",
		].join("\n"),
	)
}

export function runCli(argv = process.argv.slice(2)) {
	const [command, ...args] = argv

	switch (command) {
		case undefined:
		case "help":
		case "--help":
		case "-h":
			printHelp()
			break
		case "run": {
			const result = runTown(args)
			if (result.piInvocation.exitCode !== 0) process.exitCode = result.piInvocation.exitCode
			break
		}
		case "status":
			showTownStatus(args)
			break
		case "watch":
			watchTown(args)
			break
		case "doctor": {
			const result = runDoctor()
			if (!result.ok) process.exitCode = 1
			break
		}
		default:
			console.log(`Unknown command: ${command}`)
			printHelp()
			process.exitCode = 1
			break
	}
}

if (isDirectExecution(import.meta.url)) {
	runCli()
}
