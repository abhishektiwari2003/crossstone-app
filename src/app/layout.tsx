import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";
import { Home, FolderKanban, CreditCard, Users } from "lucide-react";

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
					<nav className="sticky bottom-0 z-40 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 md:hidden">
						<div className="grid grid-cols-4 text-xs">
							<Link className="p-2 flex flex-col items-center gap-1" href="/dashboard">
								<Home className="h-5 w-5" />
								<span>Home</span>
							</Link>
							<Link className="p-2 flex flex-col items-center gap-1" href="/projects">
								<FolderKanban className="h-5 w-5" />
								<span>Projects</span>
							</Link>
							<Link className="p-2 flex flex-col items-center gap-1" href="/payments">
								<CreditCard className="h-5 w-5" />
								<span>Payments</span>
							</Link>
							<Link className="p-2 flex flex-col items-center gap-1" href="/users">
								<Users className="h-5 w-5" />
								<span>Users</span>
							</Link>
						</div>
					</nav>
				</div>
				<Toaster richColors position="top-center" />
			</body>
		</html>
	);
}
