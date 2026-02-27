"use client";

import { useState } from "react";
import { format, subDays, subMonths, startOfYear } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

export type DateRange = {
    from: string; // YYYY-MM-DD
    to: string;   // YYYY-MM-DD
};

interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const presets = [
        { label: "Last 30 Days", getValue: () => ({ from: format(subDays(new Date(), 30), "yyyy-MM-dd"), to: format(new Date(), "yyyy-MM-dd") }) },
        { label: "Last 3 Months", getValue: () => ({ from: format(subMonths(new Date(), 3), "yyyy-MM-dd"), to: format(new Date(), "yyyy-MM-dd") }) },
        { label: "Last 6 Months", getValue: () => ({ from: format(subMonths(new Date(), 6), "yyyy-MM-dd"), to: format(new Date(), "yyyy-MM-dd") }) },
        { label: "This Year", getValue: () => ({ from: format(startOfYear(new Date()), "yyyy-MM-dd"), to: format(new Date(), "yyyy-MM-dd") }) },
        { label: "Last 12 Months", getValue: () => ({ from: format(subMonths(new Date(), 12), "yyyy-MM-dd"), to: format(new Date(), "yyyy-MM-dd") }) },
    ];

    const handleSelectPreset = (preset: typeof presets[0]) => {
        onChange(preset.getValue());
        setIsOpen(false);
    };

    // Calculate a display label based on matching presets
    const getDisplayLabel = () => {
        const matchingPreset = presets.find(
            p => p.getValue().from === value.from && p.getValue().to === value.to
        );

        if (matchingPreset) return matchingPreset.label;

        // Fallback to strict formatting
        try {
            const fromDate = format(new Date(value.from), "MMM d, yyyy");
            const toDate = format(new Date(value.to), "MMM d, yyyy");
            return `${fromDate} - ${toDate}`;
        } catch {
            return "Select Timeline";
        }
    };

    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                <button
                    className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                    <CalendarIcon className="h-4 w-4 text-indigo-500" />
                    <span className="min-w-[120px] text-left">{getDisplayLabel()}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 ring-1 ring-black/5 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
                >
                    <div className="flex flex-col space-y-1">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Quick Presets
                        </div>
                        {presets.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => handleSelectPreset(preset)}
                                className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${getDisplayLabel() === preset.label
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-slate-700 hover:bg-slate-50"
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 px-3 py-2">
                        <p className="text-xs text-slate-400 text-center">
                            Custom ranges coming soon
                        </p>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
