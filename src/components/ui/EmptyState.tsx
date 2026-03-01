"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { FolderX, Plus } from "lucide-react"

interface EmptyStateProps {
    icon?: React.ReactNode
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
}

export function EmptyState({
    icon = <FolderX className="h-8 w-8 text-muted-foreground" />,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center p-12 text-center glass-card border border-border/50 rounded-2xl min-h-[300px]"
        >
            <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-border/50">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">{description}</p>

            {actionLabel && onAction && (
                <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAction}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 shadow-md hover:shadow-lg"
                >
                    <Plus className="h-4 w-4" />
                    {actionLabel}
                </motion.button>
            )}
        </motion.div>
    )
}
