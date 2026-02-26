import Link from "next/link";
import { FolderKanban, ClipboardCheck, FileText, Phone, ArrowRight, HardHat } from "lucide-react";

type Project = { id: string; name: string; status: string };

type Props = {
    firstName: string;
    projects: Project[];
};

function getStatusStyle(status: string) {
    switch (status) {
        case "PLANNED": return "status-planned";
        case "IN_PROGRESS": return "status-in-progress";
        case "ON_HOLD": return "status-on-hold";
        case "COMPLETED": return "status-completed";
        default: return "status-pending";
    }
}

function formatStatus(status: string) {
    return status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function EngineerHome({ firstName, projects }: Props) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

    return (
        <div className="space-y-6 max-w-lg mx-auto pb-4 pt-2">
            {/* Header section (greeting) */}
            <header className="mb-8">
                <p className="text-slate-500 font-medium mb-1">Good {greeting},</p>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{firstName} 👋</h1>
            </header>

            {/* Quick Actions (Priority 1 for mobile engineers) */}
            <section>
                <h2 className="text-lg font-bold text-slate-900 mb-3 px-1">Quick Actions</h2>
                <div className="grid grid-cols-3 gap-3">
                    <Link href="/projects" className="glass-card p-3 flex flex-col items-center justify-center gap-2 text-center hover:bg-slate-50 active:scale-95 transition-all min-h-[90px]">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <ClipboardCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">Start<br />Inspection</span>
                    </Link>
                    <Link href="/projects" className="glass-card p-3 flex flex-col items-center justify-center gap-2 text-center hover:bg-slate-50 active:scale-95 transition-all min-h-[90px]">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-orange-600" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">View<br />Drawings</span>
                    </Link>
                    <Link href="#" className="glass-card p-3 flex flex-col items-center justify-center gap-2 text-center hover:bg-slate-50 active:scale-95 transition-all min-h-[90px]">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <Phone className="h-5 w-5 text-slate-600" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">Contact<br />Manager</span>
                    </Link>
                </div>
            </section>

            {/* Assigned Projects */}
            <section className="pt-4">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-lg font-bold text-slate-900">Your Projects</h2>
                    <Link href="/projects" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                        See All
                    </Link>
                </div>

                <div className="grid gap-3">
                    {projects.length > 0 ? projects.map((project) => (
                        <Link key={project.id} href={`/projects/${project.id}`}>
                            <div className="glass-card p-4 hover-lift active:scale-[0.98] transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                                        <HardHat className="h-6 w-6 text-slate-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900 text-[15px] truncate">{project.name}</div>
                                        <div className="mt-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(project.status)}`}>
                                                {formatStatus(project.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-slate-300 shrink-0" />
                            </div>
                        </Link>
                    )) : (
                        <div className="glass-card p-8 text-center bg-slate-50/50">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3">
                                <FolderKanban className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-600">No active projects assigned</p>
                            <p className="text-xs text-slate-400 mt-1">You&apos;ll see them here when a manager adds you.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
