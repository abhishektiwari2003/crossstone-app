"use client";

import { signIn } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function LoginInner() {
	const searchParams = useSearchParams();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// If a nested callbackUrl appears, normalize it to /dashboard to avoid loops
	useEffect(() => {
		try {
			const url = new URL(window.location.href);
			const callback = url.searchParams.get("callbackUrl");
			if (callback && callback.includes("/login?callbackUrl")) {
				url.searchParams.set("callbackUrl", "/dashboard");
				window.history.replaceState({}, "", url.toString());
			}
		} catch { }
	}, []);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		// Resolve safe callback URL; default to dashboard
		let callbackUrl = "/dashboard";
		try {
			const raw = searchParams.get("callbackUrl") ?? undefined;
			if (raw) {
				// Only allow same-origin relative paths to avoid open redirects
				if (raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("/login?callbackUrl")) {
					callbackUrl = raw;
				}
			}
		} catch { }
		const res = await signIn("credentials", {
			redirect: true,
			email,
			password,
			callbackUrl,
		});
		// If redirect is prevented for some reason, handle error
		if (res && (res as { error?: string | null }).error) {
			setLoading(false);
			setError("Invalid credentials");
		}
	}

	return (
		<div className="min-h-dvh flex items-center justify-center p-6 bg-[radial-gradient(80%_100%_at_50%_-20%,rgba(99,102,241,0.10),transparent)]">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Sign in</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="space-y-4">
						<div className="space-y-1">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
						</div>
						<div className="space-y-1">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
						</div>
						{error ? <p className="text-sm text-red-600">{error}</p> : null}
						<Button className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={<div className="min-h-dvh flex items-center justify-center p-6">Loading…</div>}>
			<LoginInner />
		</Suspense>
	);
}
