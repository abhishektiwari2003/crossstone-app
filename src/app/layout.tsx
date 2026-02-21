import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: "CrossStone",
	description: "Construction project tracking & payments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="bg-background text-foreground font-sans antialiased">
				{children}
				<Toaster richColors position="top-center" />
			</body>
		</html>
	);
}
