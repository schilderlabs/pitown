import { describe, expect, it } from "vitest"
import { runCli } from "./index.js"

function captureLogs(fn: () => void): string[] {
	const lines: string[] = []
	const originalLog = console.log
	console.log = (...args: unknown[]) => {
		lines.push(args.map((value) => String(value)).join(" "))
	}

	try {
		fn()
		return lines
	} finally {
		console.log = originalLog
	}
}

describe("runCli", () => {
	it("prints help for pitown --help and pitown help", () => {
		const longHelp = captureLogs(() => runCli(["--help"]))
		const subcommandHelp = captureLogs(() => runCli(["help"]))

		expect(longHelp.join("\n")).toContain("pitown")
		expect(longHelp.join("\n")).toContain("pitown run [--repo <path>] [--plan <path>] [--goal <text>]")
		expect(longHelp.join("\n")).toContain("pitown doctor")
		expect(subcommandHelp.join("\n")).toContain("pitown status [--repo <path>]")
	})
})
