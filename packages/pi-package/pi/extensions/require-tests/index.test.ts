import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { describe, expect, it, vi } from "vitest"

import requireTestsExtension from "./index"

type RegisteredHandler = (event: unknown, ctx: unknown) => unknown | Promise<unknown>

function setup() {
	const handlers: Record<string, RegisteredHandler[]> = {}
	const pi = {
		on: vi.fn((event: string, handler: RegisteredHandler) => {
			;(handlers[event] ??= []).push(handler)
		}),
		sendMessage: vi.fn(),
	} as unknown as ExtensionAPI & {
		sendMessage: ReturnType<typeof vi.fn>
	}

	requireTestsExtension(pi)

	return {
		handlers,
		pi,
	}
}

describe("require-tests extension", () => {
	it("queues a follow-up when implementation files change without tests", async () => {
		const { handlers, pi } = setup()

		await handlers["agent_start"]?.[0]?.({}, {})
		await handlers["tool_result"]?.[0]?.(
			{
				toolName: "edit",
				input: { path: "src/domain/create-widget.ts" },
				content: [],
				details: undefined,
				isError: false,
			},
			{},
		)
		await handlers["agent_end"]?.[0]?.({ messages: [] }, {})

		expect(pi.sendMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				customType: "require-tests",
				display: true,
				content: expect.stringContaining("src/domain/create-widget.ts"),
			}),
			expect.objectContaining({ triggerTurn: true }),
		)
	})

	it("does not queue a follow-up when a test file changes in the same prompt", async () => {
		const { handlers, pi } = setup()

		await handlers["agent_start"]?.[0]?.({}, {})
		await handlers["tool_result"]?.[0]?.(
			{
				toolName: "write",
				input: { path: "src/domain/create-widget.ts" },
				content: [],
				details: undefined,
				isError: false,
			},
			{},
		)
		await handlers["tool_result"]?.[0]?.(
			{
				toolName: "write",
				input: { path: "src/domain/create-widget.test.ts" },
				content: [],
				details: undefined,
				isError: false,
			},
			{},
		)
		await handlers["agent_end"]?.[0]?.({ messages: [] }, {})

		expect(pi.sendMessage).not.toHaveBeenCalled()
	})

	it("does not queue a follow-up for UI-only changes", async () => {
		const { handlers, pi } = setup()

		await handlers["agent_start"]?.[0]?.({}, {})
		await handlers["tool_result"]?.[0]?.(
			{
				toolName: "edit",
				input: { path: "apps/native/src/screens/SettingsScreen.tsx" },
				content: [],
				details: undefined,
				isError: false,
			},
			{},
		)
		await handlers["agent_end"]?.[0]?.({ messages: [] }, {})

		expect(pi.sendMessage).not.toHaveBeenCalled()
	})

	it("injects a hidden reminder before each agent run", async () => {
		const { handlers } = setup()

		const result = await handlers["before_agent_start"]?.[0]?.(
			{ systemPrompt: "base", prompt: "do work", images: [] },
			{},
		)

		expect(result).toEqual(
			expect.objectContaining({
				message: expect.objectContaining({
					customType: "require-tests",
					display: false,
				}),
			}),
		)
	})
})
