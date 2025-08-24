export const logger = {
	info: (...args: unknown[]) => console.log("[info]", ...args),
	error: (...args: unknown[]) => console.error("[error]", ...args),
	warn: (...args: unknown[]) => console.warn("[warn]", ...args),
};
