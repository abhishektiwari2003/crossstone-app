import Link from "next/link";
import Image from "next/image";
import SignOutButton from "@/components/SignOutButton";
import MobileBottomNav from "@/components/ui/MobileBottomNav";
import MobileSidebar from "@/components/ui/MobileSidebar";
import FloatingActionButton from "@/components/ui/FloatingActionButton";
import { Home, FolderKanban, CreditCard, Users, ChevronRight, ShieldAlert, BarChart3 } from "lucide-react";
import type { AppRole } from "@/lib/authz";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/theme-toggle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";

function SidebarLink({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-200"
        >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                <Icon className="h-4 w-4" />
            </div>
            <span>{label}</span>
            <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 transition-all" />
        </Link>
    );
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: Role } | null)?.role;

    return (
        <div className="min-h-dvh flex">
            {/* Sidebar (hidden on mobile) */}
            <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 sidebar-gradient border-r border-white/[0.06] z-50">
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]">
                    <div className="flex items-center h-10 w-32 relative">
                        <Image src="/logo.svg" alt="CrossStone Logo" fill className="object-contain object-left" />
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase text-slate-600">Menu</p>
                    <SidebarLink href="/dashboard" icon={Home} label="Dashboard" />
                    <SidebarLink href="/projects" icon={FolderKanban} label="Projects" />
                    <SidebarLink href="/payments" icon={CreditCard} label="Payments" />
                    <SidebarLink href="/users" icon={Users} label="Users" />
                    {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                        <>
                            <SidebarLink href="/admin/audit-logs" icon={ShieldAlert} label="System Logs" />
                            <SidebarLink href="/analytics" icon={BarChart3} label="Analytics" />
                        </>
                    )}
                </nav>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20">
                            C
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-300 truncate">CrossStone</p>
                            <p className="text-[10px] text-slate-500 truncate">Enterprise Plan</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 md:ml-64 w-full flex flex-col overflow-x-hidden">
                {/* Top bar (desktop) */}
                <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-xl hidden md:flex items-center px-8">
                    <div className="flex-1" />
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <NotificationBell />
                        <SignOutButton />
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xs font-bold text-white">
                            U
                        </div>
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 md:hidden">
                    <div className="flex items-center gap-2">
                        <MobileSidebar role={role as AppRole | undefined} />
                        <div className="flex items-center h-8 w-24 relative ml-1">
                            <Image src="/logo.svg" alt="CrossStone Logo" fill className="object-contain object-left" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <NotificationBell />
                        <SignOutButton />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 min-h-0 page-bg pb-24 md:pb-8">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Context-aware Floating Action Button */}
            <FloatingActionButton role={role} />

            {/* Mobile Bottom Nav (Role-Aware) */}
            <MobileBottomNav role={role} />
        </div>
    );
}
