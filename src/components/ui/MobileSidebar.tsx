"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, FolderKanban, CreditCard, Users, ShieldAlert, BarChart3, ChevronRight } from "lucide-react";
import type { AppRole } from "@/lib/authz";
import { useState } from "react";

type Props = {
    role?: AppRole | null;
};

function SidebarLink({ href, icon: Icon, label, onClick }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? "bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
        >
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${isActive ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                }`}>
                <Icon className="h-4 w-4" />
            </div>
            <span>{label}</span>
            <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1"}`} />
        </Link>
    );
}

export default function MobileSidebar({ role }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Menu className="h-6 w-6" />
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 border-r border-border bg-background flex flex-col">
                <SheetHeader className="p-5 border-b border-border text-left">
                    <SheetTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20">
                            C
                        </div>
                        <span className="font-bold text-foreground tracking-tight">CrossStone</span>
                    </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    <p className="px-3 mb-3 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Menu</p>
                    <SidebarLink href="/dashboard" icon={Home} label="Dashboard" onClick={() => setOpen(false)} />
                    <SidebarLink href="/projects" icon={FolderKanban} label="Projects" onClick={() => setOpen(false)} />

                    {(role === "SUPER_ADMIN" || role === "ADMIN" || role === "PROJECT_MANAGER") && (
                        <>
                            <SidebarLink href="/payments" icon={CreditCard} label="Payments" onClick={() => setOpen(false)} />
                            <SidebarLink href="/users" icon={Users} label="Users" onClick={() => setOpen(false)} />
                        </>
                    )}

                    {(role === "SUPER_ADMIN" || role === "ADMIN") && (
                        <>
                            <div className="my-4 border-t border-border" />
                            <p className="px-3 mb-3 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">System</p>
                            <SidebarLink href="/admin/audit-logs" icon={ShieldAlert} label="System Logs" onClick={() => setOpen(false)} />
                            <SidebarLink href="/analytics" icon={BarChart3} label="Analytics" onClick={() => setOpen(false)} />
                        </>
                    )}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
