export function detectPiAuthFailure(stderr: string, stdout: string): boolean {
	const output = `${stdout}\n${stderr}`.toLowerCase()
	return (
		output.includes("no models available") ||
		output.includes("not authenticated") ||
		output.includes("authentication") ||
		output.includes("/login") ||
		output.includes("api key")
	)
}

export function createPiAuthHelpMessage(): string {
	return 'Pi appears to be installed but not authenticated or configured. Verify Pi works first: pi -p "hello". Either set an API key or run `pi` and use `/login`.'
}
