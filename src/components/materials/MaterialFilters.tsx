"use client";

import { Search, Filter, Plus } from "lucide-react";
import { MATERIAL_STATUSES } from "@/types/materials";
import AddMaterialDialog from "./AddMaterialDialog";

type Props = {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    projectId: string;
    canManageMaterials: boolean;
};

export default function MaterialFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    projectId,
    canManageMaterials
}: Props) {

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-all"
                        placeholder="Search materials by name or supplier..."
                    />
                </div>

                <div className="relative w-full sm:w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4 text-slate-400" />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-all appearance-none"
                    >
                        <option value="ALL">All Statuses</option>
                        {MATERIAL_STATUSES.map(status => (
                            <option key={status} value={status}>
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
                {canManageMaterials && (
                    <AddMaterialDialog projectId={projectId} />
                )}
            </div>
        </div>
    );
}
