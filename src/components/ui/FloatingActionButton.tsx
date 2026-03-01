"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import type { AppRole } from "@/lib/authz";
import { isAdmin } from "@/lib/authz";

type Props = {
    role?: AppRole | null;
};

export default function FloatingActionButton({ role }: Props) {
    const pathname = usePathname();
    const adminRole = isAdmin(role);

    // 1. Projects List -> New Project (Removed, handled by inline header button)


    // 2. Users List -> New User
    if (pathname === "/users" && adminRole) {
        return (
            <Link href="/users/new" className="fixed bottom-24 right-5 z-40 md:hidden w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform active:scale-95 hover:scale-105">
                <Plus className="h-6 w-6" />
                <span className="sr-only">New User</span>
            </Link>
        );
    }

    // 3. Inspections List (in project details) -> Assume handled inline, but could have FAB
    // For now, these are the primary globally requested context-aware FABs

    return null;
}
