import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security headers applied to all responses
const securityHeaders = {
	"X-Frame-Options": "DENY",
	"X-Content-Type-Options": "nosniff",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"X-XSS-Protection": "1; mode=block",
	"Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

const authMiddleware = withAuth({
	pages: {
		signIn: "/login",
	},
});

export default async function middleware(req: NextRequest) {
	// Apply auth middleware to protected routes
	const isProtectedRoute = config.matcher.some((pattern) => {
		const regex = new RegExp("^" + pattern.replace(":path*", ".*"));
		return regex.test(req.nextUrl.pathname);
	});

	if (isProtectedRoute) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const authResponse = await (authMiddleware as any)(req, {} as any);
		if (authResponse) {
			// Add security headers to auth middleware response
			for (const [key, value] of Object.entries(securityHeaders)) {
				authResponse.headers.set(key, value);
			}
			return authResponse;
		}
	}

	// For non-protected routes, just add security headers
	const response = NextResponse.next();
	for (const [key, value] of Object.entries(securityHeaders)) {
		response.headers.set(key, value);
	}
	return response;
}

export const config = {
	matcher: [
		"/dashboard/:path*",
		"/projects/:path*",
		"/payments/:path*",
		"/users/:path*",
		"/api/:path*",
	],
};
