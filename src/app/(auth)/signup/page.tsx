"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Eye, EyeOff, Loader2, ArrowRight, Shield } from "lucide-react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSuccess(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-dvh flex items-center justify-center px-6 animate-in fade-in duration-500">
            <div className="w-full max-w-[420px]">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-xl tracking-tight">CrossStone</h1>
                        <p className="text-emerald-400/50 text-[10px] font-semibold tracking-[0.2em] uppercase">Construction ERM</p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-black/20">
                    {success ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                                <Shield className="h-8 w-8 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Account request sent!</h2>
                            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                Your administrator will review your request and set up your account.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:brightness-110 transition-all duration-200"
                            >
                                Back to Sign In
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-7">
                                <h2 className="text-[22px] font-bold text-white tracking-tight">Create your account</h2>
                                <p className="text-sm text-slate-400 mt-1.5">Get started with CrossStone today</p>
                            </div>

                            <form onSubmit={onSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        placeholder="John Doe"
                                        className="w-full h-11 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:bg-white/[0.05] transition-all duration-200 outline-none"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Work email</label>
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
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            placeholder="Min. 8 characters"
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

                                {error && (
                                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-red-400 text-xs font-bold">!</span>
                                        </div>
                                        <p className="text-sm text-red-400 font-medium">{error}</p>
                                    </div>
                                )}

                                <p className="text-xs text-slate-500 leading-relaxed">
                                    By creating an account, you agree to our{" "}
                                    <span className="text-slate-400 hover:text-slate-300 cursor-pointer">Terms of Service</span>{" "}
                                    and{" "}
                                    <span className="text-slate-400 hover:text-slate-300 cursor-pointer">Privacy Policy</span>.
                                </p>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            Create account
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="text-center text-sm text-slate-500 mt-6">
                                Already have an account?{" "}
                                <Link href="/login" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-slate-600 mt-8">
                    © {new Date().getFullYear()} CrossStone. All rights reserved.
                </p>
            </div>
        </div>
    );
}
