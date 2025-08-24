import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Crossstone",
	description: "Construction project tracking & payments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<div className="min-h-dvh grid grid-rows-[1fr_auto]">
					<main className="min-h-0">{children}</main>
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
