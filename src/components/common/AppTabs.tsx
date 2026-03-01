"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface AppTabsProps {
    defaultValue: string
    items: { value: string; label: string; icon?: React.ReactNode }[]
    children: React.ReactNode
    className?: string
    onValueChange?: (value: string) => void
}

export function AppTabs({ defaultValue, items, children, className, onValueChange }: AppTabsProps) {
    return (
        <Tabs defaultValue={defaultValue} onValueChange={onValueChange} className={cn("w-full", className)}>
            <div className="overflow-x-auto scrollbar-hide mb-6 border-b border-border">
                <TabsList className="h-auto p-0 bg-transparent border-0 w-max min-w-full justify-start space-x-6">
                    {items.map((item) => (
                        <TabsTrigger
                            key={item.value}
                            value={item.value}
                            className="relative rounded-none px-2 py-4 text-sm font-semibold text-muted-foreground hover:text-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors border-0 ring-0 focus-visible:ring-0 group"
                        >
                            <div className="flex items-center gap-2">
                                {item.icon && <span className="opacity-70 group-data-[state=active]:opacity-100">{item.icon}</span>}
                                {item.label}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-data-[state=active]:scale-x-100 transition-transform origin-left rounded-t-full" />
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>
            {children}
        </Tabs>
    )
}
export { TabsContent as AppTabsContent }
