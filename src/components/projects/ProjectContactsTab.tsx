"use client";

import useSWR from "swr";
import { Users, Phone } from "lucide-react";
import ContactCard from "./ContactCard";
import ContactSkeleton from "./ContactSkeleton";

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

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
};

type Props = {
    projectId: string;
};

export default function ProjectContactsTab({ projectId }: Props) {
    const { data, error, isLoading } = useSWR<{ contacts: Contact[] }>(
        `/api/projects/${projectId}/contacts`,
        fetcher
    );

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white p-4 lg:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">Project Contacts</h2>
                        <p className="text-sm text-slate-500">Quick access to your project team</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3].map(i => (
                        <ContactSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100">
                Failed to load contacts. Please try refreshing.
            </div>
        );
    }

    const contacts = data?.contacts ?? [];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 bg-white p-4 lg:p-6 rounded-2xl border border-slate-200 shadow-sm mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">Project Contacts</h2>
                    <p className="text-sm text-slate-500">Quick access to your project team</p>
                </div>
            </div>

            {/* Contact cards or empty state */}
            {contacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {contacts.map(contact => (
                        <ContactCard key={contact.id} contact={contact} />
                    ))}
                </div>
            ) : (
                <div className="glass-card p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-7 w-7 text-slate-400" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-700 mb-1">No contacts available</h3>
                    <p className="text-sm text-slate-500">Project contacts will appear here.</p>
                </div>
            )}
        </div>
    );
}
