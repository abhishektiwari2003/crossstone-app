"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialSchema, type MaterialFormValues, MATERIAL_STATUSES } from "@/types/materials";
import { useEffect } from "react";

type Props = {
    defaultValues?: Partial<MaterialFormValues>;
    onSubmit: (data: MaterialFormValues) => void;
    isLoading: boolean;
};

export default function MaterialForm({ defaultValues, onSubmit, isLoading }: Props) {
    const form = useForm<MaterialFormValues>({
        resolver: zodResolver(MaterialSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            quantity: defaultValues?.quantity || 0,
            unit: defaultValues?.unit || "kg",
            unitCost: defaultValues?.unitCost || 0,
            supplier: defaultValues?.supplier || "",
            status: defaultValues?.status || "ORDERED",
        }
    });

    // Auto-calculate total cost preview
    const qty = form.watch("quantity") || 0;
    const cost = form.watch("unitCost") || 0;
    const totalPreview = qty * cost;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Item Name *</label>
                <input
                    {...form.register("name")}
                    type="text"
                    className="w-full text-base p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Portland Cement Grade 53"
                />
                {form.formState.errors.name && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity *</label>
                    <input
                        {...form.register("quantity", { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        className="w-full text-base p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    {form.formState.errors.quantity && (
                        <p className="text-red-500 text-xs mt-1">{form.formState.errors.quantity.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Unit *</label>
                    <select
                        {...form.register("unit")}
                        className="w-full text-base p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                    >
                        <option value="kg">kg</option>
                        <option value="ton">Tons</option>
                        <option value="cu.m">Cubic Meters</option>
                        <option value="sq.m">Square Meters</option>
                        <option value="bags">Bags</option>
                        <option value="pcs">Pieces</option>
                        <option value="liter">Liters</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Unit Cost (₹) *</label>
                    <input
                        {...form.register("unitCost", { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        className="w-full text-base p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    {form.formState.errors.unitCost && (
                        <p className="text-red-500 text-xs mt-1">{form.formState.errors.unitCost.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Total Cost Eval</label>
                    <input
                        type="text"
                        value={`₹ ${totalPreview.toFixed(2)}`}
                        disabled
                        className="w-full text-base font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Supplier / Vendor</label>
                <input
                    {...form.register("supplier")}
                    type="text"
                    className="w-full text-base p-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. UltraTech Supplies Ltd."
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <div className="flex gap-2">
                    {MATERIAL_STATUSES.map(status => (
                        <label key={status} className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${form.watch("status") === status ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                            <input
                                type="radio"
                                value={status}
                                {...form.register("status")}
                                className="hidden"
                            />
                            <span className="text-xs uppercase tracking-wide">{status}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="gradient-blue text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors w-full sm:w-auto"
                >
                    {isLoading ? "Saving..." : "Save Material"}
                </button>
            </div>
        </form>
    );
}
