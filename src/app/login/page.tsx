"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
		<div className="min-h-dvh flex items-center justify-center p-6 bg-gradient-to-br from-violet-100 to-cyan-100 dark:from-zinc-950 dark:to-zinc-900">
			<form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur rounded-xl p-6 shadow">
				<h1 className="text-2xl font-semibold">Sign in</h1>
				<div className="space-y-2">
					<label htmlFor="email" className="text-sm">Email</label>
					<input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500" />
				</div>
				<div className="space-y-2">
					<label htmlFor="password" className="text-sm">Password</label>
					<input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500" />
				</div>
				{error ? <p className="text-sm text-red-600">{error}</p> : null}
				<button disabled={loading} className="w-full inline-flex items-center justify-center rounded-md bg-violet-600 text-white px-4 py-2 font-medium hover:bg-violet-700 disabled:opacity-50">{loading ? "Signing in..." : "Sign in"}</button>
			</form>
		</div>
	);
}
