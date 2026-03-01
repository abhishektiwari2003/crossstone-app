"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function CardSkeleton() {
    return (
        <div className="glass-card p-6 border-border/50 rounded-2xl flex flex-col gap-4 shimmer">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl bg-background/50" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px] bg-background/50" />
                    <Skeleton className="h-3 w-[100px] bg-background/50" />
                </div>
            </div>
            <Skeleton className="h-[1px] w-full bg-border/50 my-2" />
            <div className="flex justify-between items-end">
                <Skeleton className="h-8 w-[120px] bg-background/50 rounded-lg" />
                <Skeleton className="h-8 w-8 bg-background/50 rounded-full" />
            </div>
        </div>
    )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 glass-card rounded-xl shimmer border-border/30">
                    <Skeleton className="h-10 w-10 rounded-full bg-background/50" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3 bg-background/50" />
                        <Skeleton className="h-3 w-1/4 bg-background/50" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-full bg-background/50" />
                </div>
            ))}
        </div>
    )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/30 bg-muted/20 flex gap-4 shimmer">
                <Skeleton className="h-4 w-1/4 bg-background/50" />
                <Skeleton className="h-4 w-1/4 bg-background/50" />
                <Skeleton className="h-4 w-1/4 bg-background/50" />
                <Skeleton className="h-4 w-1/4 bg-background/50" />
            </div>
            <div className="divide-y divide-border/30">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-4 flex gap-4 items-center shimmer">
                        <Skeleton className="h-4 w-1/4 bg-background/50" />
                        <Skeleton className="h-4 w-1/4 bg-background/50" />
                        <Skeleton className="h-4 w-1/4 bg-background/50" />
                        <Skeleton className="h-8 w-24 ml-auto rounded-lg bg-background/50" />
                    </div>
                ))}
            </div>
        </div>
    )
}
