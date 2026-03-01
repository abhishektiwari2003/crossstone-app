"use client";

import { Phone, Mail, MessageCircle, ExternalLink } from "lucide-react";

type Props = {
    email: string;
    phone: string | null;
};

export default function UserContactCard({ email, phone }: Props) {
    const whatsappLink = phone ? `https://wa.me/${phone.replace(/[^0-9]/g, "")}` : null;
    const callLink = phone ? `tel:${phone}` : null;
    const emailLink = `mailto:${email}`;

    return (
        <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">Contact Info</h3>

            <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 mb-0.5">Email Address</p>
                        <a href={emailLink} className="text-sm font-semibold text-slate-900 truncate hover:text-indigo-600 transition-colors block">
                            {email}
                        </a>
                    </div>
                </div>

                {/* Phone */}
                {phone && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                            <Phone className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-500 mb-0.5">Phone Number</p>
                            <p className="text-sm font-semibold text-slate-900 truncate">
                                {phone}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-2 pt-4 border-t border-slate-100">
                {callLink && (
                    <a
                        href={callLink}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <Phone className="h-3.5 w-3.5" /> Call
                    </a>
                )}
                {whatsappLink && (
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                )}
            </div>
        </div>
    );
}
