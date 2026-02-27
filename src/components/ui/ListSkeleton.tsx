import { Skeleton } from "@/components/ui/skeleton";

export function ListSkeleton({ count = 5, height = "h-20" }: { count?: number, height?: string }) {
    return (
        <div className="grid gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/80 z-10 pointer-events-none" />
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                        <div className="space-y-2.5 w-full sm:w-[250px]">
                            <Skeleton className="h-4 w-3/4 sm:w-full" />
                            <Skeleton className="h-3 w-1/2 sm:w-2/3" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-lg hidden sm:block" />
                    </div>
                </div>
            ))}
        </div>
    );
}
