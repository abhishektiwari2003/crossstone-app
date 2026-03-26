"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, KeyRound } from "lucide-react";

type Props = {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    isActive: boolean;
    currentUserId: string;
    deleteBlockedReason: string | null;
};

export default function SuperAdminUserActions({
    userId,
    userName,
    userEmail,
    userRole,
    isActive,
    currentUserId,
    deleteBlockedReason,
}: Props) {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwError, setPwError] = useState<string | null>(null);
    const [pwOk, setPwOk] = useState<string | null>(null);
    const [pwLoading, setPwLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const canDelete = !deleteBlockedReason;

    async function onChangePassword(e: React.FormEvent) {
        e.preventDefault();
        setPwError(null);
        setPwOk(null);
        if (password.length < 6) {
            setPwError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setPwError("Passwords do not match.");
            return;
        }
        setPwLoading(true);
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setPwError(typeof data.error === "string" ? data.error : "Could not update password.");
                return;
            }
            setPwOk("Password updated.");
            setPassword("");
            setConfirmPassword("");
        } finally {
            setPwLoading(false);
        }
    }

    async function onConfirmDelete() {
        setDeleteError(null);
        setDeleteLoading(true);
        try {
            const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setDeleteError(typeof data.error === "string" ? data.error : "Could not delete user.");
                return;
            }
            setDeleteDialogOpen(false);
            router.push("/users");
            router.refresh();
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <div className="space-y-8">
            <div className="glass-card p-6 border border-slate-200/80">
                <div className="flex items-center gap-2 mb-4">
                    <KeyRound className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-900">Change password</h2>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                    Set a new password for <span className="font-medium text-slate-700">{userName}</span> ({userEmail}).
                </p>
                <form onSubmit={onChangePassword} className="space-y-4 max-w-md">
                    <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">
                            New password
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1">
                            Confirm password
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            minLength={6}
                        />
                    </div>
                    {pwError && <p className="text-sm text-red-600">{pwError}</p>}
                    {pwOk && <p className="text-sm text-emerald-600">{pwOk}</p>}
                    <button
                        type="submit"
                        disabled={pwLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Update password
                    </button>
                </form>
            </div>

            <div className="glass-card p-6 border border-red-100 bg-red-50/30">
                <div className="flex items-center gap-2 mb-2">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <h2 className="text-lg font-bold text-slate-900">Delete user</h2>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                    Permanently remove this account from the database. This cannot be undone. The user must not be linked to
                    projects or other records, or deletion will fail.
                </p>
                {!canDelete && <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">{deleteBlockedReason}</p>}
                {deleteError && <p className="text-sm text-red-600 mb-4">{deleteError}</p>}

                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <button
                            type="button"
                            disabled={!canDelete || deleteLoading}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Delete user
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete {userName}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the user <strong>{userEmail}</strong> ({userRole.replace(/_/g, " ")}
                                {isActive ? "" : ", inactive"}). You cannot undo this action.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={deleteLoading}
                                onClick={() => void onConfirmDelete()}
                            >
                                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, delete"}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {userId === currentUserId && (
                <p className="text-xs text-slate-500">You are viewing your own account. You can change your password but not delete it from here.</p>
            )}
        </div>
    );
}
