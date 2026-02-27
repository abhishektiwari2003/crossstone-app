import { type AuditLogAction } from "@/types/audit";
import {
    FileText,
    Wrench,
    MessageSquare,
    Wallet,
    User,
    CheckCircle,
    Activity,
    Plus,
    Edit2,
    UploadCloud,
} from "lucide-react";

export function getActionIcon(action: AuditLogAction, sizeClass = "h-5 w-5") {
    // Colors and icons mapped based on action type
    if (action.includes("DRAWING")) return <FileText className={`${sizeClass} text-blue-600`} />;
    if (action.includes("INSPECTION")) return <Wrench className={`${sizeClass} text-orange-600`} />;
    if (action.includes("QUERY")) return <MessageSquare className={`${sizeClass} text-purple-600`} />;
    if (action.includes("PAYMENT")) return <Wallet className={`${sizeClass} text-emerald-600`} />;
    if (action.includes("USER")) return <User className={`${sizeClass} text-slate-600`} />;
    if (action.includes("CREATE")) return <Plus className={`${sizeClass} text-indigo-600`} />;
    if (action.includes("UPDATE")) return <Edit2 className={`${sizeClass} text-amber-600`} />;
    if (action.includes("APPROVE") || action.includes("RESOLVED")) return <CheckCircle className={`${sizeClass} text-emerald-600`} />;

    // Default fallback
    return <Activity className={`${sizeClass} text-slate-400`} />;
}
