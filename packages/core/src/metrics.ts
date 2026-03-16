import type { FeedbackCycle, InterruptRecord, MetricsSnapshot, TaskAttempt } from "./types.js"

function round(value: number): number {
	return Math.round(value * 1000) / 1000
}

function diffHours(start: string, end: string): number {
	return (Date.parse(end) - Date.parse(start)) / 3_600_000
}

function average(values: number[]): number | null {
	if (values.length === 0) return null
	return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function computeInterruptRate(interrupts: InterruptRecord[], taskAttempts: TaskAttempt[]): number {
	if (taskAttempts.length === 0) return 0
	return round(interrupts.length / taskAttempts.length)
}

export function computeAutonomousCompletionRate(taskAttempts: TaskAttempt[]): number {
	const completed = taskAttempts.filter((task) => task.status === "completed")
	if (completed.length === 0) return 0
	const autonomous = completed.filter((task) => !task.interrupted)
	return round(autonomous.length / completed.length)
}

export function computeContextCoverageScore(interrupts: InterruptRecord[]): number {
	const observed = new Set(interrupts.map((interrupt) => interrupt.category))
	if (observed.size === 0) return 0

	const covered = new Set(
		interrupts.filter((interrupt) => interrupt.fixType).map((interrupt) => interrupt.category),
	)

	return round(covered.size / observed.size)
}

export function computeMeanTimeToCorrect(interrupts: InterruptRecord[]): number | null {
	const resolved = interrupts.filter((interrupt) => interrupt.resolvedAt)
	const hours = resolved.map((interrupt) => diffHours(interrupt.createdAt, interrupt.resolvedAt!))
	const value = average(hours)
	return value === null ? null : round(value)
}

export function computeFeedbackToDemoCycleTime(feedbackCycles: FeedbackCycle[]): number | null {
	const hours = feedbackCycles.map((cycle) => diffHours(cycle.feedbackAt, cycle.demoReadyAt))
	const value = average(hours)
	return value === null ? null : round(value)
}

export function computeMetrics(input: {
	taskAttempts: TaskAttempt[]
	interrupts: InterruptRecord[]
	feedbackCycles?: FeedbackCycle[]
}): MetricsSnapshot {
	const observedCategories = new Set(input.interrupts.map((interrupt) => interrupt.category))
	const coveredCategories = new Set(
		input.interrupts.filter((interrupt) => interrupt.fixType).map((interrupt) => interrupt.category),
	)
	const completedTasks = input.taskAttempts.filter((task) => task.status === "completed").length

	return {
		interruptRate: computeInterruptRate(input.interrupts, input.taskAttempts),
		autonomousCompletionRate: computeAutonomousCompletionRate(input.taskAttempts),
		contextCoverageScore: computeContextCoverageScore(input.interrupts),
		meanTimeToCorrectHours: computeMeanTimeToCorrect(input.interrupts),
		feedbackToDemoCycleTimeHours: computeFeedbackToDemoCycleTime(input.feedbackCycles ?? []),
		totals: {
			taskAttempts: input.taskAttempts.length,
			completedTasks,
			interrupts: input.interrupts.length,
			observedInterruptCategories: observedCategories.size,
			coveredInterruptCategories: coveredCategories.size,
		},
	}
}
