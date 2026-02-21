import Link from "next/link";
import { Home, FolderKanban, CreditCard, Users, Building2, ChevronRight } from "lucide-react";

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-dvh flex">
            {/* Sidebar (hidden on mobile) */}
            <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 sidebar-gradient border-r border-white/[0.06] z-50">
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-blue shadow-lg shadow-blue-500/20">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="text-white font-bold text-lg tracking-tight">CrossStone</span>
                        <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase -mt-0.5">Construction ERM</p>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest uppercase text-slate-600">Menu</p>
                    <SidebarLink href="/dashboard" icon={Home} label="Dashboard" />
                    <SidebarLink href="/projects" icon={FolderKanban} label="Projects" />
                    <SidebarLink href="/payments" icon={CreditCard} label="Payments" />
                    <SidebarLink href="/users" icon={Users} label="Users" />
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
            <div className="flex-1 md:ml-64">
                {/* Top bar (desktop) */}
                <header className="sticky top-0 z-40 h-16 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl hidden md:flex items-center px-8">
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xs font-bold text-white">
                            U
                        </div>
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="sticky top-0 z-40 h-14 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl flex items-center px-4 md:hidden">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg gradient-blue">
                            <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-base text-slate-900 tracking-tight">CrossStone</span>
                    </div>
                </header>

                {/* Page content */}
                <main className="min-h-0 page-bg">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/60 bg-white/90 backdrop-blur-xl md:hidden">
                <div className="grid grid-cols-4 text-xs">
                    <Link className="p-3 flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors" href="/dashboard">
                        <Home className="h-5 w-5" />
                        <span className="font-medium">Home</span>
                    </Link>
                    <Link className="p-3 flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors" href="/projects">
                        <FolderKanban className="h-5 w-5" />
                        <span className="font-medium">Projects</span>
                    </Link>
                    <Link className="p-3 flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors" href="/payments">
                        <CreditCard className="h-5 w-5" />
                        <span className="font-medium">Payments</span>
                    </Link>
                    <Link className="p-3 flex flex-col items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors" href="/users">
                        <Users className="h-5 w-5" />
                        <span className="font-medium">Users</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
