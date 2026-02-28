"use client";

import { useState, useEffect } from "react";
import { PaymentStatus } from "@/generated/prisma";
import type { PaymentCategory } from "@/types/payments";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Calendar as CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

export interface FilterState {
    status?: PaymentStatus | "ALL";
    category?: PaymentCategory | "ALL";
    searchQuery: string;
    minAmount: string;
    maxAmount: string;
    dateFrom?: Date;
    dateTo?: Date;
}

interface Props {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
}

export default function PaymentFilters({ filters, onChange }: Props) {
    const [localFilters, setLocalFilters] = useState<FilterState>(filters);
    const [showMore, setShowMore] = useState(false);

    // Debounce the text inputs to avoid excessive re-renders/filters
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localFilters);
        }, 300);
        return () => clearTimeout(timer);
    }, [localFilters, onChange]);

    const handleReset = () => {
        const reset: FilterState = {
            status: "ALL",
            category: "ALL",
            searchQuery: "",
            minAmount: "",
            maxAmount: "",
            dateFrom: undefined,
            dateTo: undefined,
        };
        setLocalFilters(reset);
        onChange(reset);
    };

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
            {/* Top Row: Search & Quick Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search invoice or notes..."
                        value={localFilters.searchQuery}
                        onChange={(e) => setLocalFilters({ ...localFilters, searchQuery: e.target.value })}
                        className="pl-9 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                    />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
                    <Select
                        value={localFilters.status || "ALL"}
                        onValueChange={(val) => setLocalFilters({ ...localFilters, status: val as PaymentStatus | "ALL" })}
                    >
                        <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="OVERDUE">Overdue</SelectItem>
                            <SelectItem value="PARTIAL">Partial</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={localFilters.category || "ALL"}
                        onValueChange={(val) => setLocalFilters({ ...localFilters, category: val as PaymentCategory | "ALL" })}
                    >
                        <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="ALL">All Categories</SelectItem>
                            <SelectItem value="MATERIAL">Material</SelectItem>
                            <SelectItem value="LABOR">Labor</SelectItem>
                            <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>

                    <button
                        onClick={() => setShowMore(!showMore)}
                        className={`col-span-2 lg:col-span-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${showMore ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        More Filters
                    </button>

                    {/* Only show clear if there are active filters */}
                    {(localFilters.status !== "ALL" || localFilters.category !== "ALL" || localFilters.searchQuery || localFilters.minAmount || localFilters.maxAmount || localFilters.dateFrom) && (
                        <button
                            onClick={handleReset}
                            className="col-span-2 lg:col-span-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        >
                            <X className="h-4 w-4" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded Row: Amount & Dates */}
            {showMore && (
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount Range (₹)</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={localFilters.minAmount}
                                onChange={(e) => setLocalFilters({ ...localFilters, minAmount: e.target.value })}
                                className="rounded-xl border-slate-200"
                            />
                            <span className="text-slate-400">-</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={localFilters.maxAmount}
                                onChange={(e) => setLocalFilters({ ...localFilters, maxAmount: e.target.value })}
                                className="rounded-xl border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Range</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={localFilters.dateFrom ? format(localFilters.dateFrom, "yyyy-MM-dd") : ""}
                                onChange={(e) => setLocalFilters({ ...localFilters, dateFrom: e.target.value ? new Date(e.target.value) : undefined })}
                                className="rounded-xl border-slate-200 text-slate-600"
                            />
                            <span className="text-slate-400">to</span>
                            <Input
                                type="date"
                                value={localFilters.dateTo ? format(localFilters.dateTo, "yyyy-MM-dd") : ""}
                                onChange={(e) => setLocalFilters({ ...localFilters, dateTo: e.target.value ? new Date(e.target.value) : undefined })}
                                className="rounded-xl border-slate-200 text-slate-600"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
