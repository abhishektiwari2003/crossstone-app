"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code2 } from "lucide-react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    metadata: Record<string, unknown> | null;
    actionTitle?: string;
};

export default function AuditMetadataDialog({ isOpen, onClose, metadata, actionTitle }: Props) {
    if (!metadata) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-w-[95vw] rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
                <DialogHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-100">
                    <DialogTitle className="flex items-center gap-2 text-lg text-slate-900">
                        <Code2 className="h-5 w-5 text-indigo-600" />
                        Metadata Details
                    </DialogTitle>
                    {actionTitle && (
                        <p className="text-sm text-slate-500 mt-1.5">{actionTitle}</p>
                    )}
                </DialogHeader>

                <div className="p-6">
                    <ScrollArea className="max-h-[60vh] w-full rounded-xl bg-slate-900 border border-slate-800">
                        <div className="p-4 overflow-x-auto custom-scrollbar">
                            <pre className="text-sm text-emerald-400 font-mono leading-relaxed">
                                {JSON.stringify(metadata, null, 2)}
                            </pre>
                        </div>
                    </ScrollArea>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
