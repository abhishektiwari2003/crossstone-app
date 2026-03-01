"use client";

import useSWR, { useSWRConfig } from "swr";
import type { Material } from "@/types/materials";
import { PackageOpen, AlertCircle, Trash2, Calendar } from "lucide-react";
import EditMaterialDialog from "./EditMaterialDialog";
import { toast } from "sonner";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
    projectId: string;
    searchTerm: string;
    statusFilter: string;
    canManage: boolean;
};

const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch");
    return data.items || data;
};

export default function MaterialList({ projectId, searchTerm, statusFilter, canManage }: Props) {
    const { data: materials, error, isLoading } = useSWR<Material[]>(
        `/api/projects/${projectId}/materials`,
        fetcher
    );

    const { mutate } = useSWRConfig();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="glass-card p-4 h-20 shimmer rounded-xl border border-slate-200" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-12 text-center bg-red-50/50 border-red-100 rounded-2xl">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-red-600">Failed to load materials</p>
            </div>
        );
    }

    if (!materials || materials.length === 0) {
        return (
            <div className="glass-card p-16 text-center border border-slate-200 rounded-2xl shadow-sm bg-white/50">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <PackageOpen className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No materials tracked</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    {canManage
                        ? "Start tracking materials, deliveries, and costs by adding your first item."
                        : "There are no materials recorded for this project yet."}
                </p>
            </div>
        );
    }

    // Client-side filtering
    const filteredMaterials = materials.filter(m => {
        const matchesSearch =
            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.supplier && m.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleDelete = async () => {
        if (!deletingId) return;

        try {
            const res = await fetch(`/api/materials/${deletingId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete material");

            toast.success("Material Deleted", { description: "The record has been removed." });
            mutate(`/api/projects/${projectId}/materials`);
            mutate(`/api/projects/${projectId}/materials/summary`);
        } catch (error: any) {
            toast.error("Error", { description: error.message });
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "ORDERED": return "bg-blue-50 text-blue-700 border-blue-200";
            case "DELIVERED": return "bg-amber-50 text-amber-700 border-amber-200";
            case "USED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <>
            <div className="hidden md:block glass-card overflow-hidden shadow-sm border border-slate-200 rounded-2xl bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Item Name</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Total Cost</th>
                                <th className="px-6 py-4">Supplier</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date Added</th>
                                {canManage && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredMaterials.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{m.name}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <span className="font-medium text-slate-900">{m.quantity}</span> {m.unit}
                                        <div className="text-[10px] text-slate-400 mt-0.5">{formatCurrency(m.unitCost)} / {m.unit}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(m.totalCost)}</td>
                                    <td className="px-6 py-4 text-slate-600">{m.supplier || "—"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(m.status)}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(m.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    {canManage && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <EditMaterialDialog material={m} />
                                                <button
                                                    onClick={() => setDeletingId(m.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="md:hidden space-y-3">
                {filteredMaterials.map((m) => (
                    <div key={m.id} className="glass-card p-5 border border-slate-200 rounded-xl relative group">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-900 text-base pr-8">{m.name}</h4>
                            <span className={`absolute top-4 right-4 inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(m.status)}`}>
                                {m.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4 mt-3">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Quantity</p>
                                <p className="text-sm font-semibold text-slate-900">{m.quantity} <span className="text-slate-500 font-medium">{m.unit}</span></p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Total Cost</p>
                                <p className="text-sm font-bold text-slate-900">{formatCurrency(m.totalCost)}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Supplier</p>
                                <p className="text-sm text-slate-700">{m.supplier || "Not specified"}</p>
                            </div>
                        </div>

                        {canManage && (
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <EditMaterialDialog material={m} />
                                <button
                                    onClick={() => setDeletingId(m.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Material Record</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete this material? This action cannot be undone and will update the project's summary costs.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl border-slate-200 text-slate-600">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/25 border-0">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
