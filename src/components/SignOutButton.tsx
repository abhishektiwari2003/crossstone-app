"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
	return (
		<Button
			variant="outline"
			type="button"
			onClick={() => signOut({ callbackUrl: "/login" })}
			className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 gap-2 text-sm font-medium transition-all"
		>
			<LogOut className="h-4 w-4" />
			Sign out
		</Button>
	);
}
