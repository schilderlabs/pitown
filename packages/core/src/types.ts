export type InterruptCategory =
	| "missing-context"
	| "spec-gap"
	| "policy-gap"
	| "validation-gap"
	| "tooling-failure"
	| "external-blocker"

export type FixType =
	| "adr"
	| "docs"
	| "policy"
	| "prompt"
	| "skill"
	| "tooling"
	| "validation"

export type RunMode = "single-pi"

export interface InterruptRecord {
	id: string
	runId: string
	taskId?: string
	category: InterruptCategory
	subtype?: string
	summary: string
	requiresHuman: boolean
	createdAt: string
	resolvedAt?: string
	fixType?: FixType
}

export interface TaskAttempt {
	taskId: string
	status: "completed" | "blocked" | "skipped"
	interrupted: boolean
	startedAt: string
	endedAt: string
}

export interface FeedbackCycle {
	feedbackAt: string
	demoReadyAt: string
}

export interface MetricsSnapshot {
	interruptRate: number
	autonomousCompletionRate: number
	contextCoverageScore: number
	meanTimeToCorrectHours: number | null
	feedbackToDemoCycleTimeHours: number | null
	totals: {
		taskAttempts: number
		completedTasks: number
		interrupts: number
		observedInterruptCategories: number
		coveredInterruptCategories: number
	}
}

export interface RunOptions {
	cwd?: string
	artifactsDir: string
	branch?: string | null
	goal?: string | null
	mode?: RunMode
	planPath?: string | null
	recommendedPlanDir?: string | null
	piCommand?: string
}

export interface RunManifest {
	runId: string
	repoId: string
	repoSlug: string
	repoRoot: string
	branch: string
	goal: string | null
	planPath: string | null
	recommendedPlanDir: string | null
	mode: RunMode
	startedAt: string
	endedAt: string | null
	stopReason: string | null
	leasePath: string
	piExitCode: number | null
	completedTaskCount: number
	blockedTaskCount: number
	skippedTaskCount: number
	totalCostUsd: number
}

export interface PiInvocationRecord {
	command: string
	cwd: string
	repoRoot: string
	planPath: string | null
	goal: string | null
	startedAt: string
	endedAt: string
	exitCode: number
	stdoutPath: string
	stderrPath: string
	promptSummary: string
}

export interface RunSummary {
	runId: string
	mode: RunMode
	createdAt: string
	success: boolean
	message: string
	piExitCode: number
	recommendedPlanDir: string | null
}

export interface ControllerRunResult {
	runId: string
	runDir: string
	latestDir: string
	manifest: RunManifest
	metrics: MetricsSnapshot
	summary: RunSummary
	piInvocation: PiInvocationRecord
}
