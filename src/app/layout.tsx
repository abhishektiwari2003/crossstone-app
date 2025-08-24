import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Crossstone",
	description: "Construction project tracking & payments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="bg-white text-zinc-900">
				<header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 hidden md:block">
					<div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
						<Link href="/dashboard" className="font-semibold">Crossstone</Link>
						<nav className="flex items-center gap-6 text-sm">
							<Link href="/projects">Projects</Link>
							<Link href="/payments">Payments</Link>
							<Link href="/users">Users</Link>
						</nav>
					</div>
				</header>
				<div className="min-h-dvh grid grid-rows-[1fr_auto] bg-[radial-gradient(80%_100%_at_50%_-20%,rgba(99,102,241,0.10),transparent)]">
					<main className="min-h-0 mx-auto w-full max-w-6xl px-6 py-6">{children}</main>
					<nav className="sticky bottom-0 z-40 border-t bg-white/80 dark:bg-zinc-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:hidden">
						<div className="grid grid-cols-4 text-sm">
							<Link className="p-3 text-center" href="/dashboard">Dashboard</Link>
							<Link className="p-3 text-center" href="/projects">Projects</Link>
							<Link className="p-3 text-center" href="/payments">Payments</Link>
							<Link className="p-3 text-center" href="/users">Users</Link>
						</div>
					</nav>
				</div>
				<Toaster richColors position="top-center" />
			</body>
		</html>
	);
}
