"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

type Props = {
    value: string;
    onChange: (val: string) => void;
};

export default function PaymentsSearchBar({ value, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut to focus search (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="relative flex-1 w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search invoices, clients, projects, or amounts..."
                className="w-full pl-10 pr-20 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />

            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                {value ? (
                    <button
                        onClick={() => {
                            onChange("");
                            inputRef.current?.focus();
                        }}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors mr-1"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                ) : (
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded mr-1">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                )}
            </div>
        </div>
    );
}
