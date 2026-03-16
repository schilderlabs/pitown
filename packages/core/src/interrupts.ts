import { randomUUID } from "node:crypto"
import type { InterruptCategory, InterruptRecord } from "./types.js"

export interface CreateInterruptInput {
	runId: string
	taskId?: string
	category: InterruptCategory
	subtype?: string
	summary: string
	requiresHuman?: boolean
	createdAt?: string
}

export function createInterruptRecord(input: CreateInterruptInput): InterruptRecord {
	return {
		id: randomUUID(),
		runId: input.runId,
		category: input.category,
		summary: input.summary,
		requiresHuman: input.requiresHuman ?? true,
		createdAt: input.createdAt ?? new Date().toISOString(),
		...(input.taskId ? { taskId: input.taskId } : {}),
		...(input.subtype ? { subtype: input.subtype } : {}),
	}
}

export function resolveInterrupt(
	interrupt: InterruptRecord,
	options: Pick<InterruptRecord, "resolvedAt" | "fixType">,
): InterruptRecord {
	return {
		...interrupt,
		...(options.resolvedAt ? { resolvedAt: options.resolvedAt } : {}),
		...(options.fixType ? { fixType: options.fixType } : {}),
	}
}
