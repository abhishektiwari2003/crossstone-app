"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Props = {
    projectId: string;
    memberId: string;
    memberName: string | null;
};

export default function RemoveEngineerDialog({ projectId, memberId, memberName }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleRemove() {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: "Failed to remove" }));
                throw new Error(data.error || "Failed to remove engineer");
            }
            toast.success(`${memberName || "Engineer"} removed from project`);
            setOpen(false);
            router.refresh();
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-slate-200 shadow-2xl max-w-sm">
                <AlertDialogHeader>
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-2">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <AlertDialogTitle className="text-center text-lg">Remove Engineer</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        Are you sure you want to remove <strong className="text-slate-900">{memberName || "this engineer"}</strong> from this project? They will lose access immediately.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-2">
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleRemove}
                        disabled={loading}
                        className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                        {loading ? "Removing..." : "Remove"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
