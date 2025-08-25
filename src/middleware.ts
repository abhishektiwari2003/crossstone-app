export { default as middleware } from "next-auth/middleware";

export const config = {
	matcher: [
		// Protect everything except Next internals, API auth, public assets, and auth pages
		"/((?!api/auth|_next/static|_next/image|favicon.ico|login$|login/|public).*)",
	],
};
