"use client";

import { useState } from "react";
import type { UserRole } from "@/types/drawings";
import MaterialSummaryCards from "./MaterialSummaryCards";
import MaterialFilters from "./MaterialFilters";
import MaterialList from "./MaterialList";
import { PackageOpen } from "lucide-react";

type Props = {
    projectId: string;
    userRole: UserRole;
};

export default function ProjectMaterialsTab({ projectId, userRole }: Props) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // RBAC: CLIENT and SITE_ENGINEER are view-only. 
    // ADMIN, SUPER_ADMIN, PROJECT_MANAGER can edit.
    const canManageMaterials = ["ADMIN", "SUPER_ADMIN", "PROJECT_MANAGER"].includes(userRole);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 bg-white p-4 lg:p-6 rounded-2xl border border-slate-200 shadow-sm flex-1">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                        <PackageOpen className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">Material & Inventory</h2>
                        <p className="text-sm text-slate-500">Track items, deliveries, and associated costs</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <MaterialSummaryCards projectId={projectId} />

            {/* Filters Area */}
            <div className="glass-card p-4">
                <MaterialFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    projectId={projectId}
                    canManageMaterials={canManageMaterials}
                />
            </div>

            {/* Data Grid / List */}
            <MaterialList
                projectId={projectId}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                canManage={canManageMaterials}
            />
        </div>
    );
}
