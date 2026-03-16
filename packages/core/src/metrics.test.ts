import { describe, expect, it } from "vitest"
import { computeMetrics } from "./metrics.js"

describe("computeMetrics", () => {
	it("computes the initial KPI snapshot", () => {
		const snapshot = computeMetrics({
			taskAttempts: [
				{
					taskId: "T-1",
					status: "completed",
					interrupted: false,
					startedAt: "2026-03-10T00:00:00.000Z",
					endedAt: "2026-03-10T01:00:00.000Z",
				},
				{
					taskId: "T-2",
					status: "blocked",
					interrupted: true,
					startedAt: "2026-03-10T01:00:00.000Z",
					endedAt: "2026-03-10T02:00:00.000Z",
				},
			],
			interrupts: [
				{
					id: "I-1",
					runId: "run-1",
					category: "spec-gap",
					summary: "Acceptance criteria were ambiguous.",
					requiresHuman: true,
					createdAt: "2026-03-10T01:15:00.000Z",
					resolvedAt: "2026-03-10T03:15:00.000Z",
					fixType: "docs",
				},
			],
			feedbackCycles: [
				{
					feedbackAt: "2026-03-10T04:00:00.000Z",
					demoReadyAt: "2026-03-10T10:00:00.000Z",
				},
			],
		})

		expect(snapshot.interruptRate).toBe(0.5)
		expect(snapshot.autonomousCompletionRate).toBe(1)
		expect(snapshot.contextCoverageScore).toBe(1)
		expect(snapshot.meanTimeToCorrectHours).toBe(2)
		expect(snapshot.feedbackToDemoCycleTimeHours).toBe(6)
	})
})
