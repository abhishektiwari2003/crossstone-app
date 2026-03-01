"use client";

import { signIn } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

function LoginInner() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
        let callbackUrl = "/dashboard";
        try {
            const raw = searchParams.get("callbackUrl") ?? undefined;
            if (raw) {
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
        if (res && (res as { error?: string | null }).error) {
            setLoading(false);
            setError("Invalid email or password. Please try again.");
        }
    }

    return (
        <div className="min-h-dvh flex items-center justify-center px-6 animate-in fade-in duration-500">
            <div className="w-full max-w-[420px]">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="flex items-center h-12 w-36 relative">
                        <Image src="/logo.svg" alt="CrossStone Logo" fill className="object-contain" />
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/20">
                    <div className="mb-7">
                        <h2 className="text-[22px] font-bold text-white tracking-tight">Welcome back</h2>
                        <p className="text-sm text-slate-400 mt-1.5">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="you@company.com"
                                className="w-full h-11 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:bg-white/[0.05] transition-all duration-200 outline-none"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
                                <button type="button" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full h-11 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:bg-white/[0.05] transition-all duration-200 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-0"
                            />
                            <label htmlFor="remember" className="text-sm text-slate-400 select-none cursor-pointer">Remember me</label>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-red-400 text-xs font-bold">!</span>
                                </div>
                                <p className="text-sm text-red-400 font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
                            Create account
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs text-slate-600 mt-8">
                    © {new Date().getFullYear()} CrossStone. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-dvh flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>
        }>
            <LoginInner />
        </Suspense>
    );
}
