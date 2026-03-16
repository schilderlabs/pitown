import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { isEditToolResult, isWriteToolResult } from "@mariozechner/pi-coding-agent"

const TEST_FILE_PATTERN = /(^|\/)(__tests__|tests?)\/|\.(test|spec)\.[^.]+$/i
const UI_DIRECTORY_PATTERNS = [/^apps\/native\//i, /^packages\/frontend-native\//i, /^packages\/ui-native\//i]
const UI_FILE_PATTERN = /\.(tsx|jsx)$/i
const IMPLEMENTATION_FILE_PATTERN = /\.(c|m)?(t|j)sx?$|\.(py|rb|go|rs|java|kt|swift)$/i

export interface ModifiedFileAnalysis {
	modifiedFiles: string[]
	implementationFiles: string[]
	testFiles: string[]
	requiresTests: boolean
	hasRequiredTests: boolean
}

export function normalizeFilePath(filePath: string): string {
	return filePath.replace(/^@/, "").replace(/\\/g, "/")
}

export function isTestFile(filePath: string): boolean {
	return TEST_FILE_PATTERN.test(normalizeFilePath(filePath))
}

export function isUiOnlyFile(filePath: string): boolean {
	const normalizedPath = normalizeFilePath(filePath)
	return UI_FILE_PATTERN.test(normalizedPath) || UI_DIRECTORY_PATTERNS.some((pattern) => pattern.test(normalizedPath))
}

export function isImplementationFile(filePath: string): boolean {
	const normalizedPath = normalizeFilePath(filePath)
	if (!IMPLEMENTATION_FILE_PATTERN.test(normalizedPath)) return false
	if (isTestFile(normalizedPath)) return false
	if (isUiOnlyFile(normalizedPath)) return false
	if (normalizedPath.endsWith(".d.ts")) return false
	return true
}

export function analyzeModifiedFiles(files: Iterable<string>): ModifiedFileAnalysis {
	const modifiedFiles = [...new Set(Array.from(files, normalizeFilePath))]
	const implementationFiles = modifiedFiles.filter(isImplementationFile)
	const testFiles = modifiedFiles.filter(isTestFile)

	return {
		modifiedFiles,
		implementationFiles,
		testFiles,
		requiresTests: implementationFiles.length > 0,
		hasRequiredTests: testFiles.length > 0,
	}
}

function buildReminderMessage(implementationFiles: string[]): string {
	const changedFiles = implementationFiles.map((filePath) => `- ${filePath}`).join("\n")

	return [
		"Test guard: you changed implementation code without also updating tests.",
		"",
		"Changed implementation files:",
		changedFiles,
		"",
		"Before finishing, write or update tests that verify behavior through public interfaces.",
		"Prefer integration-style tests that describe what the system does and can survive refactors.",
	].join("\n")
}

export default function requireTestsExtension(pi: ExtensionAPI) {
	let modifiedFiles = new Set<string>()

	pi.on("before_agent_start", async () => ({
		message: {
			customType: "require-tests",
			content:
				"If you modify non-UI implementation files, also add or update tests in the same turn. UI-only TSX/JSX changes and files under apps/native, packages/frontend-native, or packages/ui-native are exempt.",
			display: false,
		},
	}))

	pi.on("agent_start", async () => {
		modifiedFiles = new Set<string>()
	})

	pi.on("tool_result", async (event) => {
		if (event.isError) return
		if (!isEditToolResult(event) && !isWriteToolResult(event)) return

		const filePath = event.input["path"]
		if (typeof filePath !== "string") return

		modifiedFiles.add(normalizeFilePath(filePath))
	})

	pi.on("agent_end", async () => {
		const analysis = analyzeModifiedFiles(modifiedFiles)
		if (!analysis.requiresTests || analysis.hasRequiredTests) return

		pi.sendMessage(
			{
				customType: "require-tests",
				content: buildReminderMessage(analysis.implementationFiles),
				display: true,
			},
			{ triggerTurn: true },
		)
	})
}
