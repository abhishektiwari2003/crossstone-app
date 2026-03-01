"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import MaterialForm from "./MaterialForm";
import type { MaterialFormValues } from "@/types/materials";
import { useSWRConfig } from "swr";
import { toast } from "sonner";

type Props = {
    projectId: string;
};

export default function AddMaterialDialog({ projectId }: Props) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { mutate } = useSWRConfig();

    const onSubmit = async (data: MaterialFormValues) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/materials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to add material");
            }

            toast.success("Material Added", {
                description: `${data.quantity} ${data.unit} of ${data.name} saved successfully.`,
            });

            // Revalidate SWR caches
            mutate(`/api/projects/${projectId}/materials`);
            mutate(`/api/projects/${projectId}/materials/summary`);

            setOpen(false);
        } catch (error: any) {
            toast.error("Error", {
                description: error.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-xl gradient-blue px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all w-full sm:w-auto justify-center">
                    <Plus className="h-4 w-4" />
                    Add Material
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
                <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
                    <DialogTitle className="text-xl font-bold text-slate-900">Add New Material</DialogTitle>
                </DialogHeader>
                <div className="p-6">
                    <MaterialForm onSubmit={onSubmit} isLoading={isSubmitting} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
