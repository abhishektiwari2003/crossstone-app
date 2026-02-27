"use client";

import { Phone, Mail, MessageCircle } from "lucide-react";

type Contact = {
    id: string;
    name: string;
    role: string;
    designation: string | null;
    phone: string | null;
    email: string;
    whatsappLink: string | null;
    callLink: string | null;
    emailLink: string;
};

const ROLE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
    PROJECT_MANAGER: { label: "Project Manager", bg: "bg-purple-100", text: "text-purple-700" },
    SITE_ENGINEER: { label: "Site Engineer", bg: "bg-blue-100", text: "text-blue-700" },
    CLIENT: { label: "Client", bg: "bg-emerald-100", text: "text-emerald-700" },
    ADMIN: { label: "Admin", bg: "bg-amber-100", text: "text-amber-700" },
    SUPER_ADMIN: { label: "Super Admin", bg: "bg-amber-100", text: "text-amber-700" },
};

function getInitials(name: string) {
    if (!name) return "U";
    return name
        .split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function ContactCard({ contact }: { contact: Contact }) {
    const badge = ROLE_BADGE[contact.role] ?? { label: contact.role, bg: "bg-slate-100", text: "text-slate-700" };

    return (
        <div className="glass-card p-4 hover-lift transition-all duration-200">
            {/* Top section: Avatar + Info */}
            <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
                    {getInitials(contact.name)}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">{contact.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text} mt-0.5`}>
                        {badge.label}
                    </span>
                    {contact.designation && (
                        <p className="text-sm text-slate-500 mt-1 truncate">{contact.designation}</p>
                    )}
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 my-3" />

            {/* Action buttons row */}
            <div className="flex items-center gap-2">
                {contact.callLink && (
                    <a
                        href={contact.callLink}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-sm transition-colors"
                    >
                        <Phone className="h-4 w-4" />
                        <span className="hidden sm:inline">Call</span>
                    </a>
                )}
                <a
                    href={contact.emailLink}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm transition-colors"
                >
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Email</span>
                </a>
                {contact.whatsappLink && (
                    <a
                        href={contact.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl bg-green-50 hover:bg-green-100 text-green-700 font-medium text-sm transition-colors"
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                )}
            </div>
        </div>
    );
}
