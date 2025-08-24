"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
	return (
		<Button variant="outline" type="button" onClick={() => signOut({ callbackUrl: "/login" })}>
			Sign out
		</Button>
	);
}
