"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PenBox } from "lucide-react";
import MaterialForm from "./MaterialForm";
import type { Material, MaterialFormValues } from "@/types/materials";
import { useSWRConfig } from "swr";
import { toast } from "sonner";

type Props = {
    material: Material;
};

export default function EditMaterialDialog({ material }: Props) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { mutate } = useSWRConfig();

    const onSubmit = async (data: MaterialFormValues) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/materials/${material.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to update material");
            }

            toast.success("Material Updated", {
                description: `${data.name} was successfully updated.`,
            });

            // Revalidate SWR caches
            mutate(`/api/projects/${material.projectId}/materials`);
            mutate(`/api/projects/${material.projectId}/materials/summary`);

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
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <PenBox className="h-4 w-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
                <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
                    <DialogTitle className="text-xl font-bold text-slate-900">Edit Material: {material.name}</DialogTitle>
                </DialogHeader>
                <div className="p-6">
                    <MaterialForm
                        defaultValues={{
                            name: material.name,
                            quantity: material.quantity,
                            unit: material.unit,
                            unitCost: material.unitCost,
                            supplier: material.supplier || "",
                            status: material.status,
                        }}
                        onSubmit={onSubmit}
                        isLoading={isSubmitting}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
