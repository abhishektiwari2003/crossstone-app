"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface AppModalProps {
    trigger?: React.ReactNode
    title: string
    description?: string
    children: React.ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
    className?: string
}

export function AppModal({
    trigger,
    title,
    description,
    children,
    isOpen,
    onOpenChange,
    className
}: AppModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className={cn("sm:max-w-[500px] p-0 border-0 bg-transparent shadow-none overflow-hidden", className)}>
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="w-full h-full bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-modal flex flex-col"
                    >
                        <DialogHeader className="p-6 border-b border-border/50 bg-muted/20">
                            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                            {description && (
                                <DialogDescription className="text-muted-foreground mt-1.5 leading-relaxed">
                                    {description}
                                </DialogDescription>
                            )}
                        </DialogHeader>
                        <div className="p-6">
                            {children}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    )
}
