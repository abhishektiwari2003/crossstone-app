"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Loader2, HardHat, Check } from "lucide-react";

type User = { id: string; name: string; email: string; role: string };

type Props = {
    projectId: string;
    /** User IDs already assigned as members (to exclude from selector) */
    existingMemberUserIds?: string[];
};

export default function ProjectEngineerSelector({ projectId, existingMemberUserIds = [] }: Props) {
    const router = useRouter();
    const [engineers, setEngineers] = useState<User[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addingId, setAddingId] = useState<string | null>(null);

    // Fetch site engineers on mount
    useEffect(() => {
        setLoading(true);
        fetch("/api/users")
            .then(r => r.json())
            .then(d => {
                const allUsers: User[] = d.users || [];
                setEngineers(allUsers.filter(u => u.role === "SITE_ENGINEER" || u.role === "PROJECT_MANAGER"));
            })
            .catch(() => toast.error("Failed to load engineers"))
            .finally(() => setLoading(false));
    }, []);

    // Filter out already assigned engineers
    const available = engineers.filter(e => !existingMemberUserIds.includes(e.id));

    async function handleAdd(user: User) {
        setAddingId(user.id);
        try {
            const res = await fetch(`/api/projects/${projectId}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, role: user.role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to assign engineer");
            toast.success(`${user.name} assigned to project`);
            setOpen(false);
            router.refresh();
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally {
            setAddingId(null);
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    size="sm"
                    className="rounded-xl gradient-orange border-0 text-white font-semibold gap-1.5 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:brightness-110 transition-all"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Member
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-72 rounded-xl border-slate-200 shadow-2xl" align="end">
                <Command className="rounded-xl">
                    <CommandInput placeholder="Search engineers or managers..." className="border-0" />
                    <CommandList>
                        <CommandEmpty className="py-6 text-center">
                            {loading ? (
                                <div className="flex items-center justify-center gap-2 text-slate-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading...
                                </div>
                            ) : available.length === 0 && engineers.length > 0 ? (
                                <div className="text-sm text-slate-500">
                                    <HardHat className="h-5 w-5 mx-auto mb-2 text-slate-400" />
                                    All eligible users are already assigned
                                </div>
                            ) : (
                                <div className="text-sm text-slate-500">
                                    <HardHat className="h-5 w-5 mx-auto mb-2 text-slate-400" />
                                    No eligible users found
                                </div>
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {available.map(user => (
                                <CommandItem
                                    key={user.id}
                                    value={`${user.name} ${user.email}`}
                                    onSelect={() => handleAdd(user)}
                                    disabled={addingId === user.id}
                                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                        {user.name?.charAt(0) ?? "U"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-900 truncate">{user.name}</div>
                                        <div className="text-xs text-slate-500 truncate flex items-center gap-2">
                                            <span>{user.email}</span>
                                            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
                                                • {user.role.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                    </div>
                                    {addingId === user.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-orange-500 shrink-0" />
                                    ) : (
                                        <Check className="h-4 w-4 text-slate-300 opacity-0 group-data-[selected]:opacity-100 shrink-0" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
