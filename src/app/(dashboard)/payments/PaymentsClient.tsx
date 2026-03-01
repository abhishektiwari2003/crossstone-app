"use client";

import { useState, useMemo, useEffect } from "react";
import { CreditCard, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import PaymentsSearchBar from "./PaymentsSearchBar";
import PaymentsFilterPanel from "./PaymentsFilterPanel";
import PaymentCard from "./PaymentCard";
import type { Role } from "@/generated/prisma";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Represents the data structure passed from the server
export type PaymentData = {
    id: string;
    amount: number | string;
    currency: string;
    status: string;
    category?: string | null;
    invoiceNumber?: string | null;
    paidAt?: Date | null;
    dueDate?: Date | null;
    notes?: string | null;
    project?: {
        id: string;
        name: string;
        client?: { id: string; name: string; email: string; } | null;
    } | null;
    createdAt: Date;
};

type Props = {
    initialPayments: PaymentData[];
    role: Role;
};

export function getPaymentStatusStyle(status: string) {
    switch (status) {
        case "PAID": return "text-emerald-700 bg-emerald-50 border-emerald-200";
        case "PARTIAL": return "text-blue-700 bg-blue-50 border-blue-200";
        case "OVERDUE": return "text-red-700 bg-red-50 border-red-200";
        case "PENDING": return "text-amber-700 bg-amber-50 border-amber-200";
        default: return "text-slate-700 bg-slate-50 border-slate-200";
    }
}

export function formatStatus(status: string) {
    return status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function PaymentsClient({ initialPayments, role }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

    const showMaster = role === "SUPER_ADMIN" || role === "ADMIN" || role === "PROJECT_MANAGER";

    // Filtering Logic
    const filteredPayments = useMemo(() => {
        return initialPayments.filter(p => {
            // Status match
            if (statusFilter !== "ALL" && p.status !== statusFilter) return false;

            // Category match
            if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false;

            // Search match
            if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase();
                const matchesInvoice = p.invoiceNumber?.toLowerCase().includes(q) ?? false;
                const matchesClient = p.project?.client?.name.toLowerCase().includes(q) ?? false;
                const matchesProject = p.project?.name.toLowerCase().includes(q) ?? false;
                const matchesAmount = String(p.amount).includes(q);
                const matchesStatus = p.status.toLowerCase().includes(q);
                const matchesCategory = p.category?.toLowerCase().includes(q) ?? false;

                if (!matchesInvoice && !matchesClient && !matchesProject && !matchesAmount && !matchesStatus && !matchesCategory) {
                    return false;
                }
            }

            return true;
        });
    }, [initialPayments, searchQuery, statusFilter, categoryFilter]);

    // Summary calculations (based on ALL payments or FILTERED payments? Usually ALL makes sense for total KPI, but filtered is good context. Let's do ALL for global context).
    const totalAmount = initialPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const paidAmount = initialPayments.filter(p => p.status === "PAID").reduce((sum, p) => sum + Number(p.amount), 0);
    const pendingAmount = initialPayments.filter(p => p.status === "PENDING").reduce((sum, p) => sum + Number(p.amount), 0);
    const overdueAmount = initialPayments.filter(p => p.status === "OVERDUE").reduce((sum, p) => sum + Number(p.amount), 0);

    const summaryCards = [
        { label: "Total Revenue", value: totalAmount, icon: CreditCard, gradient: "gradient-blue", shadow: "shadow-blue-500/20" },
        { label: "Paid", value: paidAmount, icon: TrendingUp, gradient: "gradient-emerald", shadow: "shadow-emerald-500/20" },
        { label: "Pending", value: pendingAmount, icon: Clock, gradient: "gradient-amber", shadow: "shadow-amber-500/20" },
        { label: "Overdue", value: overdueAmount, icon: AlertTriangle, gradient: "gradient-red", shadow: "shadow-red-500/20" },
    ];

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
            {/* Header & Sticky Summary */}
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Payments</h1>
                    <p className="text-muted-foreground mt-1">Manage and track project finances.</p>
                </div>

                {/* Summary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                    {summaryCards.map((card) => (
                        <div key={card.label} className={`glass-card hover-lift rounded-2xl p-5 shadow-lg ${card.shadow} relative overflow-hidden group`}>
                            {/* Background decoration */}
                            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${card.gradient.includes('blue') ? 'bg-blue-400' : card.gradient.includes('emerald') ? 'bg-emerald-400' : card.gradient.includes('amber') ? 'bg-amber-400' : 'bg-red-400'}`} />

                            <div className="flex items-center gap-3 mb-3 relative z-10">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.gradient.includes('blue') ? 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-600' :
                                        card.gradient.includes('emerald') ? 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600' :
                                            card.gradient.includes('amber') ? 'bg-amber-100/50 dark:bg-amber-900/30 text-amber-600' :
                                                'bg-red-100/50 dark:bg-red-900/30 text-red-600'
                                    }`}>
                                    <card.icon className="h-5 w-5" />
                                </div>
                                <div className="text-sm font-semibold text-muted-foreground">{card.label}</div>
                            </div>
                            <div className="text-2xl font-bold text-foreground relative z-10">
                                ₹{card.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Search & Filters Row */}
            <div className="sticky top-16 z-30 -mx-4 px-4 py-3 sm:mx-0 sm:px-0 sm:py-0 sm:static bg-background/80 backdrop-blur-md sm:bg-transparent">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <PaymentsSearchBar value={searchQuery} onChange={setSearchQuery} />
                    <PaymentsFilterPanel
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                    />
                </div>
            </div>

            {/* Payments List/Table */}
            <div className="glass-card overflow-hidden">
                <div className="hidden md:block w-full overflow-x-auto">
                    <Table>
                        {showMaster ? <TableCaption className="pb-4">All payments across projects</TableCaption> : <TableCaption className="pb-4">Your project payments</TableCaption>}
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="font-semibold text-foreground">Invoice</TableHead>
                                <TableHead className="font-semibold text-foreground">Amount</TableHead>
                                <TableHead className="font-semibold text-foreground">Status</TableHead>
                                {showMaster && <TableHead className="font-semibold text-foreground">Project</TableHead>}
                                {showMaster && <TableHead className="font-semibold text-foreground">Client</TableHead>}
                                <TableHead className="text-right font-semibold text-foreground">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.length ? filteredPayments.map((p) => (
                                <TableRow key={p.id} className="border-border hover:bg-muted/50 transition-colors cursor-pointer group">
                                    <TableCell className="font-medium text-muted-foreground">
                                        {p.invoiceNumber || <span className="opacity-50">N/A</span>}
                                    </TableCell>
                                    <TableCell className="font-bold text-foreground text-base">₹{Number(p.amount).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${getPaymentStatusStyle(p.status)}`}>
                                            {formatStatus(p.status)}
                                        </span>
                                    </TableCell>
                                    {showMaster && <TableCell className="max-w-[180px] truncate text-foreground font-medium">{p.project?.name}</TableCell>}
                                    {showMaster && <TableCell className="max-w-[150px] truncate text-muted-foreground">{p.project?.client?.name || "-"}</TableCell>}
                                    <TableCell className="text-right text-muted-foreground text-sm">
                                        {new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={showMaster ? 6 : 4} className="text-center py-16">
                                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                                            <CreditCard className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-base font-semibold text-foreground">No payments found</p>
                                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Payments Cards */}
                <div className="md:hidden divide-y divide-border">
                    {filteredPayments.length ? filteredPayments.map((p) => (
                        <PaymentCard key={p.id} payment={p} showMaster={showMaster} />
                    )) : (
                        <div className="p-10 text-center space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                                <CreditCard className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-base font-semibold text-foreground">No payments found</p>
                                <p className="text-xs text-muted-foreground mt-1">Try another search term.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
