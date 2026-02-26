"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderKanban, CreditCard, Users, ClipboardCheck, FileText, User } from "lucide-react";
import type { AppRole } from "@/lib/authz";

type Props = {
    role?: AppRole | null;
};

export default function MobileBottomNav({ role }: Props) {
    const pathname = usePathname();

    let links = [];

    if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "PROJECT_MANAGER") {
        links = [
            { href: "/dashboard", label: "Home", icon: Home },
            { href: "/projects", label: "Projects", icon: FolderKanban },
            { href: "/payments", label: "Payments", icon: CreditCard },
            { href: "/users", label: "Users", icon: Users },
        ];
    } else if (role === "SITE_ENGINEER") {
        links = [
            { href: "/dashboard", label: "Home", icon: Home },
            { href: "/projects", label: "Projects", icon: FolderKanban },
            { href: "/inspections", label: "Inspections", icon: ClipboardCheck },
            { href: "/profile", label: "Profile", icon: User },
        ];
    } else { // CLIENT
        links = [
            { href: "/dashboard", label: "Home", icon: Home },
            { href: "/projects", label: "Projects", icon: FolderKanban },
            { href: "/documents", label: "Documents", icon: FileText },
            { href: "/profile", label: "Profile", icon: User },
        ];
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/60 bg-white/95 backdrop-blur-xl md:hidden pb-safe">
            <div className={`grid grid-cols-${links.length} text-xs`}>
                {links.map((link) => {
                    // Match exact path or subpaths (e.g. /projects/123)
                    const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href + "/"));
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`p-3 flex flex-col items-center gap-1.5 transition-colors min-h-[60px] justify-center ${isActive ? "text-blue-600" : "text-slate-500 hover:text-blue-600"
                                }`}
                        >
                            <div className="relative">
                                <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110 stroke-[2.5px]" : "stroke-2"}`} />
                                {isActive && (
                                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
                                )}
                            </div>
                            <span className={`text-[10px] sm:text-xs tracking-wide ${isActive ? "font-bold" : "font-medium"}`}>
                                {link.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
