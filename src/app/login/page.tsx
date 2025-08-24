"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		const res = await signIn("credentials", {
			redirect: false,
			email,
			password,
		});
		setLoading(false);
		if (res?.error) {
			setError("Invalid credentials");
			return;
		}
		router.replace("/dashboard");
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
