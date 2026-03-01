"use client";

import { Filter } from "lucide-react";

type Props = {
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    categoryFilter: string;
    setCategoryFilter: (val: string) => void;
};

export default function PaymentsFilterPanel({ statusFilter, setStatusFilter, categoryFilter, setCategoryFilter }: Props) {
    return (
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            <div className="flex items-center gap-2 shrink-0 bg-background border border-border rounded-xl p-1 shadow-sm">
                <div className="pl-2 pr-1 text-muted-foreground">
                    <Filter className="h-4 w-4" />
                </div>

                {/* Status Dropdown */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-sm font-medium focus:outline-none pr-6 py-1.5 cursor-pointer text-foreground appearance-none border-r border-border rounded-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundPosition: 'right 0.35rem center', backgroundSize: '1em 1em', backgroundRepeat: 'no-repeat' }}
                >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
                </select>

                {/* Category Dropdown (Mock/Optional Example) */}
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-transparent text-sm font-medium focus:outline-none pl-2 pr-6 py-1.5 cursor-pointer text-foreground appearance-none rounded-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundPosition: 'right 0.35rem center', backgroundSize: '1em 1em', backgroundRepeat: 'no-repeat' }}
                >
                    <option value="ALL">All Categories</option>
                    <option value="MATERIAL">Material</option>
                    <option value="LABOR">Labor</option>
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="OTHER">Other</option>
                </select>
            </div>
        </div>
    );
}
